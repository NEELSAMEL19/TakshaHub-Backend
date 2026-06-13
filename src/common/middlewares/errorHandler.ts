import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError.js";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err); // ✅ keep full log internally

  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;

  // ✅ ONLY trust AppError messages
  const message = isAppError
    ? err.message
    : "Something went wrong. Please try again later.";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: isAppError ? err.errors : undefined, // optional
  });
};

export default errorHandler;
