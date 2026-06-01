import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;

  const message = isAppError
    ? err.message
    : err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;