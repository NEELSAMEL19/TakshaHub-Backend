import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PortalType } from "@prisma/client";
import validate from "../../config/validate.js";
import { AppError } from "./AppError.js";

interface JwtPayload {
  id: string;
  role: PortalType;
  schoolId?: string;
}

interface AuthUser {
  id: string;
  role: PortalType;
  schoolId?: bigint;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(new AppError("No token provided. Please login first.", 401));
    }

    const decoded = jwt.verify(token, validate.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      schoolId: decoded.schoolId ? BigInt(decoded.schoolId) : undefined,
    };

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
