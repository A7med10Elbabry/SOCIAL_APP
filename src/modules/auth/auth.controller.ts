import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import authService from "./auth.service";
import { successResponse } from "../../common/response";
import { IloginResopnse } from "./auth.entity";
import { validation } from "../../middleware";
import * as validators from "./auth.validation"

const router = Router()



router.post("/signup",
    validation(validators.signup),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = await authService.signup(req.body)
    return successResponse<any>({res, status: 201, data})
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.login(req.body, `${req.protocol}://${req.host}`)
    return successResponse<IloginResopnse>({res, data: result})
});


router.patch("/confirm-email",
    validation(validators.confirmEmail),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        await authService.confirmEmail(req.body)
    return successResponse<Response>({res})
});



router.patch("/resend-confirm-email",
    validation(validators.resendConfirmEmail),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        await authService.resendConfirmEmail(req.body)
    return successResponse<Response>({res})
});

export default router

