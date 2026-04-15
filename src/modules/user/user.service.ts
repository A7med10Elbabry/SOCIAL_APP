import { HydratedDocument } from "mongoose";
import { IUSer } from "../../common/interfaces";
import { LogoutEnum } from "../../common/enums";
import { redisService, RedisService } from "../../common/service";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRSES_IN } from "../../config/config";
import { TokenService } from "../../common/service/token.service";
import { ConflictException } from "../../common/exceptions";



class UserService{
    private readonly redis: RedisService
    private readonly tokenService: TokenService;
    constructor(){
        this.redis =  redisService
        this.tokenService = new TokenService()
    }


    async profile(user:HydratedDocument<IUSer>): Promise<any>{
        return user.toJSON()
    }

    async logout ({flag}: {flag: LogoutEnum}, user: HydratedDocument<IUSer>, {jti, iat, sub}: {jti: string, iat: number, sub: string}):Promise<number> {

    let status = 200
    switch (flag) {
        case LogoutEnum.ALL:
            user.changeCredentialsTime = new Date()
            await user.save()
            
            await this.redis.deleteKey(await this.redis.Keys(this.redis.revokeTokenKey({userId: sub, jti})))
            break;
        default:
            await this.tokenService.createRevokeToken({userId: sub, jti, ttl: iat + REFRESH_EXPIRSES_IN})
            status = 201
            break;
    }
    return status
}


   async rotateToken (user: HydratedDocument<IUSer>, {jti, iat, sub}: {jti: string, iat: number, sub: string}, issuer: string){
    if ((iat + ACCESS_EXPIRES_IN)* 1000 >= Date.now() + (30000)) {
        throw new ConflictException( "current token is still valid")
    }

       await this.tokenService.createRevokeToken({userId: sub, jti, ttl: iat + REFRESH_EXPIRSES_IN})
        return await this.tokenService.CreateLoginCredentials(user, issuer)
}
}


export default new UserService()