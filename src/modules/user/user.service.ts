import { HydratedDocument } from "mongoose";
import { IUSer } from "../../common/interfaces";
import { LogoutEnum } from "../../common/enums";
import { redisService, RedisService, s3Service, S3Service } from "../../common/service";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRSES_IN } from "../../config/config";
import { TokenService } from "../../common/service/token.service";
import { ConflictException } from "../../common/exceptions";
import { UserRepository } from "../../DB/repository";



class UserService {
    private readonly redis: RedisService
    private readonly tokenService: TokenService;
    private readonly userRepository: UserRepository
    private readonly s3: S3Service
    constructor() {
        this.redis = redisService
        this.tokenService = new TokenService()
        this.userRepository = new UserRepository()
        this.s3 = s3Service
    }


    async profile(user: HydratedDocument<IUSer>): Promise<any> {
        return user.toJSON()
    }

    async profileImage(file: Express.Multer.File, user: HydratedDocument<IUSer>) {
        const oldPic = user.profilePicture
        const {Key} = await this.s3.uploadLargeAsset({
            file,
            path: `users/${user._id.toString()}/profile`
        })

        user.profilePicture = Key as string        
        await user.save()
        if (oldPic) {
            await this.s3.deleteAsset({
                Key:oldPic
            })
        }
        return user.toJSON()
    }

    async profileCoverImages (files: Express.Multer.File[], user: HydratedDocument<IUSer>){
        const oldUrls = user.profileCoverPicture
          const urls = await this.s3.uploadAssets({
            files,
            path: `users/${user._id.toString()}/profile/cover`
        })

        user.profileCoverPicture = urls         
        await user.save()
        if (oldUrls) {
            await this.s3.deleteAssets({
                Keys:oldUrls.map((url:string)=> {return{Key:url}})
            })
        }
        return user.toJSON()
    }
    

    async logout({ flag }: { flag: LogoutEnum }, user: HydratedDocument<IUSer>, { jti, iat, sub }: { jti: string, iat: number, sub: string }): Promise<number> {

        let status = 200
        switch (flag) {
            case LogoutEnum.ALL:
                user.changeCredentialsTime = new Date()
                await user.save()

                await this.redis.deleteKey(await this.redis.Keys(this.redis.revokeTokenKey({ userId: sub, jti })))
                break;
            default:
                await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: iat + REFRESH_EXPIRSES_IN })
                status = 201
                break;
        }
        return status
    }



    async hardDelete(user: HydratedDocument<IUSer>) {
        await this.userRepository.deleteOne({ filter: { _id: user._id, force: true } })
        return 200;
    }

    async rotateToken(user: HydratedDocument<IUSer>, { jti, iat, sub }: { jti: string, iat: number, sub: string }, issuer: string) {
        if ((iat + ACCESS_EXPIRES_IN) * 1000 >= Date.now() + (30000)) {
            throw new ConflictException("current token is still valid")
        }

        await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: iat + REFRESH_EXPIRSES_IN })
        return await this.tokenService.CreateLoginCredentials(user, issuer)
    }

    public softDelete(user: HydratedDocument<IUSer>) {
        this.userRepository.updateOne({ filter: { _id: user._id }, update: { deletedAt: new Date() } })
        return 200
    }

}


export default new UserService()