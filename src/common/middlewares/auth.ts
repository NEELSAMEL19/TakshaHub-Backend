import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./AppError.js";
import env from "../../config/env.js";

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(new AppError("No token provided. Please login first.", 401));
    }

    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    ) as JwtPayload;

    req.user = decoded;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired. Please login again.", 401));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }

    return next(error);
  }
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
      ) as JwtPayload;

      req.user = decoded;
    }

    return next();
  } catch {
    return next();
  }
};