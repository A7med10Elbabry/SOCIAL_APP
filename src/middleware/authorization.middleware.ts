import { RoleEnum } from "../common/enums"
import type{ NextFunction, Request, Response } from "express"
import { ForbiddenException } from "../common/exceptions"


export const authorization =  (accessRoles:RoleEnum[])=>{
    return async (req:Request, res:Response, next:NextFunction)=>{
        if (!accessRoles.includes(req.user.role)) {
            throw new ForbiddenException("Not authorized account")
        }
        next()
    }
}