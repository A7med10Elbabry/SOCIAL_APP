import type { NextFunction,Response, Request } from "express"

interface IError extends Error {
        statusCode: number,
}


export const globalErrorHandler = (err: IError, req:Request, res:Response, next:NextFunction)=>{
    console.error(err.statusCode || 500)

    res.status(err.statusCode || 500).json({
    massage: err.message || "internal server error",
    cause: err.cause,
    stack: err.stack,
    error: err 
})
}
