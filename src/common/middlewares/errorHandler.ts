import type { NextFunction, Request, Response } from "express"
import { AppError } from "./AppError"


const errorHandler = (err:any,req:Request,res:Response,next:NextFunction) =>{

    const appError = err instanceof AppError

    const message = appError ? err.message : ""

    const statusCode = appError ? err.statusCode : 500

    return res.status(statusCode).json({
        success:false,
        message
    })
}

export default errorHandler