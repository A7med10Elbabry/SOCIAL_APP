import type{ NextFunction, Request, Response } from "express";
import { BadRequestException } from "../common/exceptions";
import { ZodError, ZodType } from "zod";


type keyReqType = keyof Request 
type schemaType = Partial<Record<keyReqType, ZodType>>
// type issuesType =  {
//             key: keyReqType,
//             issues: Array<{
//                 message: string,
//                 path: (string | symbol | number | undefined | null) []
//             }>
//         } []


type issuesType =  Array<{

    key: keyReqType,
    issues: Array<{
        message: string,
        path: Array<(string | symbol | number | undefined | null)>
    }>
}>

export const validation = (schema: schemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const issues: issuesType = []
        for (const key of Object.keys(schema) as keyReqType []) {
            if (!schema[key]) continue;
            const validationResult = schema[key].safeParse(req[key])
            if (!validationResult.success) {
                const error = validationResult.error as ZodError;
                issues.push({key, issues: error.issues.map(issue => {return {message: issue.message, path: issue.path}})})
            }
        if (issues.length) {
            throw new BadRequestException('Validation Error', {extra:issues})
        }
        next();
    };
}}