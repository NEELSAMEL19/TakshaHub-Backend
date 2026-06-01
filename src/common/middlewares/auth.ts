import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./AppError.js";
import env from "../../config/env.js";

// Extend Express Request to include user data
declare global { namespace Express { interface Request {
      user?: {
        id: bigint;
        email: string;
        fullName: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      throw new AppError("No token provided. Please login first.", 401);
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      id: bigint;
      email: string;
      fullName: string;
    };

    // 3️⃣ Attach user to request
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired. Please login again.", 401));
    }
    next(error);
  }
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        id: bigint;
        email: string;
        fullName: string;
      };
      req.user = decoded;
    }

    next();
  } catch (error: any) {
    // Continue even if token is invalid (optional auth)
    next();
  }
};
