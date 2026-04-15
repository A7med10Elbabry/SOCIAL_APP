import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

import { REFRESH_EXPIRSES_IN, SYSTEM_REFRESH_TOKEN_SECERET_KEY, SYSTEM_TOKEN_SECERET_KEY, USER_REFRESH_TOKEN_SECERET_KEY, USER_TOKEN_SECERET_KEY } from '../../config/config'
import { RoleEnum, TokenTypeEnum } from '../enums'
import { BadRequestException, NotFoundException } from '../exceptions'
import { UserRepository } from '../../DB/repository'
import { redisService, RedisService } from './redis.service'
import { HydratedDocument, Types } from 'mongoose'
import { IUSer } from '../interfaces'
import { randomUUID } from 'node:crypto'

type SignatureType = { accessSignature : string, RefreshSignature : string }


export class TokenService {
    private readonly userRepository: UserRepository;
    private readonly redis: RedisService ;
    constructor(){
        this.userRepository = new UserRepository()
        this.redis = redisService
    }

    sign = async ({
    payload,
    secret=USER_TOKEN_SECERET_KEY,
    options
}:{
      payload:object ,
    secret:string,
    options:SignOptions
}):Promise<string>=>{

    return jwt.sign(payload, secret, options)
}

 verify = async ({
    token,
    secret=USER_TOKEN_SECERET_KEY,
   
}:{
    token:string,
    secret:string,
}):Promise<JwtPayload>=>{

    return jwt.verify(token, secret) as JwtPayload
}

 getSignatureLevel = async (tokenType = TokenTypeEnum.ACCESS, signatureLevel: RoleEnum)=>{

    let signatures = await this.getTokenSignature(signatureLevel)
    let signature;
    switch (tokenType) {
        case TokenTypeEnum.REFRESH:
            signature= signatures.RefreshSignature
            break;
        default:
            signature = signatures.accessSignature
            break;
    }

    return signature
}



 getTokenSignature = async (role: RoleEnum): Promise<SignatureType>=>{

    let signature: SignatureType;
    switch (role) {
        case RoleEnum.ADMIN:
            signature = {
                accessSignature :SYSTEM_TOKEN_SECERET_KEY,
                RefreshSignature : SYSTEM_REFRESH_TOKEN_SECERET_KEY
            }
            break;
        default:

            signature = {
                accessSignature : USER_TOKEN_SECERET_KEY,
                RefreshSignature : USER_REFRESH_TOKEN_SECERET_KEY
            }
            break;
    }

    return signature
}




 CreateLoginCredentials = async (user: HydratedDocument<IUSer>, issuer: string)=>{
    const {accessSignature, RefreshSignature} = await this.getTokenSignature(user.role)

            const jwtid = randomUUID()
            const access_Token = await this.sign({
                payload:{sub: user._id},
                secret: accessSignature,
                options:{
                    issuer,
                    audience:[TokenTypeEnum.ACCESS as unknown as string, user.role as unknown as string],
                    expiresIn:1800,
                    jwtid
                }
        }) 
    
            const refreshToken = await this.sign({
                payload:{sub: user._id},
                secret: RefreshSignature,
                options:{
                    issuer,
                    audience:[TokenTypeEnum.REFRESH as unknown as string, user.role as unknown as string],
                    expiresIn:REFRESH_EXPIRSES_IN,
                    jwtid
                }
            })


        return {access_Token, refreshToken}
}



 decodeToken = async ({token, tokenType= TokenTypeEnum.ACCESS}:{token: string, tokenType: TokenTypeEnum})
 :Promise<{user: HydratedDocument<IUSer>, decoded: JwtPayload}>=>{
    const decoded = jwt.decode(token) as JwtPayload;
    console.log(decoded);
    if (!decoded?.aud?.length) {
        throw new BadRequestException("missing token audience")
    }


    const [decodedTokenType, signatureLevel] = decoded.aud;
    if ( decodedTokenType == undefined || signatureLevel == undefined) {
        throw new BadRequestException("invalid token audience")
    }
    if(tokenType !== decodedTokenType as unknown as TokenTypeEnum){
        throw new BadRequestException("invalid token type", {cause:{status:404}})
    }

    console.log(this.redis.revokeTokenKey({userId: decoded.sub as string, jti: decoded.jti as string}));
    
    if (decoded.jti && await this.redis.get(this.redis.revokeTokenKey({userId: decoded.sub as string, jti: decoded.jti as string}))) {
        throw new BadRequestException("Invalid login session")

    }
    // const signatureLevel = await getSignatureLevel(audienceType)
    const secret = await this.getSignatureLevel(decodedTokenType as unknown as TokenTypeEnum,signatureLevel as unknown as RoleEnum)
    

    const verifyDate = await this.verify({
        token, 
        secret
    })

    
    const user = await this.userRepository.findOne({filter:{_id:verifyDate.sub}})
    if (!user) {
        throw new NotFoundException(" not register account")
    }
    console.log({verifyDate});

       if (user.changeCredentialsTime && user.changeCredentialsTime.getTime() >= (decoded.iat as number | 0 ) * 1000) {
        throw new BadRequestException("invalid login session")
    }

    return {user, decoded}
}

 createRevokeToken = async ({userId, jti, ttl}:{userId: string | Types.ObjectId , jti: string, ttl: number})=>{
                await this.redis.set({
                key: this.redis.revokeTokenKey({userId, jti}),
                value: jti,
                ttl
            })
            return
}

}