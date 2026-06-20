import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PortalType } from "@prisma/client";
import validate from "../../config/validate.js";
import { AppError } from "./AppError.js";

interface JwtPayload {
  id: string;
  role: PortalType;
  roleId: string;
  schoolId?: string;
}

interface AuthUser {
  id: string;
  role: PortalType;
  roleId: bigint;
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
      roleId: BigInt(decoded.roleId),
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

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  // Ensure the user has been authenticated by authMiddleware first
  if (!req.user) {
    return next(
      new AppError("Unauthorized: Authentication context missing.", 401),
    );
  }

  // Check if their portal role matches ADMIN
  if (req.user.role !== PortalType.ADMIN) {
    return next(
      new AppError(
        "Forbidden: Only institutional administrators can perform this action.",
        403,
      ),
    );
  }

  return next();
};
