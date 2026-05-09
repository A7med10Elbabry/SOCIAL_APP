import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from "./post.validation"
import { postService } from "./post.service";

const router = Router()



router.post("/",
    authentication(),
    cloudFileUpload({
        validation: fileFieldValidation.image,
    }).array("files"),
    validation(validators.createPost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
       await postService.createPost(req.body, req.user)
        return successResponse({ res, status:201 })
    })


export default router