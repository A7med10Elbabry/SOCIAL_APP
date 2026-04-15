
import type { Response } from "express"

export const successResponse = <T>({res, massage= "Done", status=200, data}:{
    massage?:String,
    res: Response,
    status?: number,
    data?: T
}) => {
    return res.status(status).json({
        massage,
        status,
        data
    })
}