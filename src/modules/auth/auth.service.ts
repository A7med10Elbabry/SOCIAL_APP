import { ConfirmEmailDto, LoginDto, resendConfirmEmailDto, SignupDto } from "./auth.dto"
import { IloginResopnse} from "./auth.entity"
import { IUSer } from "../../common/interfaces"
import { UserRepository } from "../../DB/repository"
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exceptions"
import { compare_hash, encrypt, generate_hash } from "../../common/utils/security"
import { emailTemplete, sendEmail,emailEvent } from "../../common/email"
import {RedisService, redisService} from "../../common/service"
import { EmailEnum, ProviderEnum } from "../../common/enums"
import {createRandomOtp} from "../../common/utils"
import { TokenService } from "../../common/service/token.service"




class AuthService {

    
    private readonly UserRepository: UserRepository;
    private readonly redis: RedisService ;
    private readonly tokenService: TokenService;
    constructor(){
        this.UserRepository = new UserRepository()
        this.redis = redisService
        this.tokenService = new TokenService()
    }
    



  async login (inputs :LoginDto, issuer: string):Promise<IloginResopnse>  {
    
    const { email, password} = inputs
    const user = await this.UserRepository.findOne({
        filter: {email, provider: ProviderEnum.SYSTEM, confirmedEmail: {$exists: true}}
    })
    if (!user) {
        throw new NotFoundException("invalid login credentials")
    }

    if(!await compare_hash({plain_text: password, cipher_text:user.password})){
        throw new NotFoundException("invalid login credentials")
    }
    
    return await this.tokenService.CreateLoginCredentials(user, issuer)
}

private async sendEmailOtp({ email, subject, title }: { email: string; subject: EmailEnum; title: string }) {
    const isBlockedTTL = await this.redis.ttl(this.redis.blockOtpKey({ email, subject }))
    if (isBlockedTTL > 0) {
      throw new BadRequestException(`Sorry we cannot request new otp while are blocked please try again after ${isBlockedTTL}`)
    }

    const remainingOtpTTL = await this.redis.ttl(this.redis.otpKey({ email, subject }))
    if (remainingOtpTTL > 0) {
      throw new BadRequestException(`Sorry we cannot request new otp while current orp still active please try again after ${remainingOtpTTL}`)
    }

    const maxTrial = await this.redis.get(this.redis.maxAttemptOtpKey({ email, subject }))
    if (maxTrial >= 3) {
      await this.redis.set({
        key: this.redis.blockOtpKey({ email, subject }),
        value: 1 as unknown as string,
        ttl: 7 * 60
      })
      throw new BadRequestException("you have reached the max trial")
    }

    const code = createRandomOtp()
    await this.redis.set({
      key: this.redis.otpKey({ email, subject }),
      value: await generate_hash({ plain_text: `${code}` }),
      ttl: 120
    })

    emailEvent.emit("sendEmail", async () => {
      await sendEmail({
        to: email,
        subject,
        html: emailTemplete({ code, title })
      })

      await this.redis.incr(this.redis.maxAttemptOtpKey({ email, subject }))
    })
  }



public async signup({email, password, username, phone}: SignupDto): Promise<IUSer> {
    


    const checkUserExist = await this.UserRepository.findOne({filter:{email},
    projection: "email",
})

    if(checkUserExist){
        checkUserExist.save()
        throw new ConflictException("Email exists")
    }
    const user= await this.UserRepository.createOne({ 
        data :{
            email,
            password: await generate_hash({plain_text:password})
            ,username,
            phone: phone? await encrypt(phone) : undefined
        }
    })

    await this.sendEmailOtp({email, subject:EmailEnum.CONFIRM_EMAIL, title:"Verfiy Email"})
    return user.toJSON();
}


    async confirmEmail ({email, otp}: ConfirmEmailDto) {
  const hashedOTP = await this.redis.get(this.redis.otpKey({ email, subject: EmailEnum.CONFIRM_EMAIL }));
  if (!hashedOTP) {
    throw new NotFoundException("Expired OTP");
  }


  const account = await this.UserRepository.findOne({ filter: {  email, confirmEmail: { $exists: false },provider: ProviderEnum.SYSTEM,},});
  if (!account) {
    throw new NotFoundException("fail to finding matching account");
  }
  if (!await compare_hash({plain_text:otp, cipher_text:hashedOTP})) {
    throw new ConflictException("Invalid OTP");
  }
  account.confirmEmail = new Date();
  await account.save();
  await this.redis.deleteKey(await this.redis.Keys(this.redis.otpKey({email, subject: EmailEnum.CONFIRM_EMAIL})));
  return
};


    async resendConfirmEmail ({email}:resendConfirmEmailDto)  {
  const account = await this.UserRepository.findOne({
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: ProviderEnum.SYSTEM,
    },
  });
  if (!account) {
    throw new NotFoundException("fail to finding matching account");
  }

  await this.sendEmailOtp({ email, subject:EmailEnum.CONFIRM_EMAIL, title:"Verfiy Email" });
  return;
};



}
export default new AuthService()