import { z } from "zod";
import { AvailablityEnum } from "../../common/enums";
import { Types } from "mongoose";
import { genralValidationFeilds } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";


export const createPost = {
    body:z.strictObject({
        content:z.string().optional(),
        files:z.array(genralValidationFeilds.file(fileFieldValidation.image)).optional(),
        tags:z.array(z.string()).optional(),
        availablity:z.coerce.number().default(AvailablityEnum.PUBLIC),
    }).superRefine((args, ctx)=>{
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"content is required"
            })
        }

        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)]
            if(uniqueTags.length != args.tags.length){
                ctx.addIssue({
                    code:"custom",
                    path:["tags"],
                    message:"duplicate tags"
                })
            }

            for(const tag of args.tags){
                if (!Types.ObjectId.isValid(tag)) {
                       ctx.addIssue({
                    code:"custom",
                    path:["tags"],
                    message:"invalid user Id"
                })
                }
                
            }
        }


    }),
    
}



