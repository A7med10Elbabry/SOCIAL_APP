import type{ NextFunction, Request, Response } from "express"
import {  UnauthorizedException } from "../common/exceptions"
import {TokenTypeEnum } from "../common/enums"
import { TokenService } from "../common/services"


export const authentication =  (tokenType:TokenTypeEnum = TokenTypeEnum.ACCESS)=>{
    const tokenService = new TokenService()
    return async (req:Request, res:Response, next:NextFunction)=>{
        if (!req.headers.authorization) {
            throw new UnauthorizedException("missing authorization key")
        }
        const {user, decoded} = await tokenService.decodeToken({token:req.headers?.authorization, tokenType})
        req.user = user
        req.decoded = decoded
        next()
    }
}



