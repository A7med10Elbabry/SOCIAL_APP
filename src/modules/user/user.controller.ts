import { Router } from "express";
import { successResponse } from "../../common/response";
import type { Request, Response, NextFunction } from "express";
import UserService from "./user.service";
import { authentication, authorization } from "../../middleware";
import { endpoints } from "./user.authorization";
import { TokenTypeEnum } from "../../common/enums";


const router = Router();

router.get("/",
    authentication(),
    authorization(endpoints.profile)    ,
    async (req: Request, res: Response, next: NextFunction) =>{
    const data = await UserService.profile(req.user)
    successResponse({res, data})
})

router.delete("/hardDelete", authentication(), async (req,res,next)=>{
    const status = await UserService.hardDelete( req.user)
    return successResponse({res, status})
})

router.post("/logout", authentication(), async (req,res,next)=>{
    const status = await UserService.logout(req.body, req.user, req.decoded as {jti: string, iat: number, sub: string})
    return successResponse({res, status})
})

router.get("/rotate" ,authentication(TokenTypeEnum.REFRESH), async (req,res,next)=>{

    const result  = await UserService.rotateToken(req.user, req.decoded as {jti: string, iat: number, sub: string}, `${req.protocol}://${req.host}`)
    return successResponse({res, data: result})
})

router.delete("/softDelete", authentication(), async (req,res,next)=>{
    const status = await UserService.softDelete( req.user)
    return successResponse({res, status})
})

export default router