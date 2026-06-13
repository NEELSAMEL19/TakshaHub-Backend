import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { MemberRole } from "@prisma/client";
import validate from "../../config/validate.js";
import { AppError } from "./AppError.js";

interface JwtPayload {
  id: string;
  role: MemberRole;
  schoolId?: string;
}

interface AuthUser {
  id: string;
  role: MemberRole;
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

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;

    if (!token) return next();

    const decoded = jwt.verify(token, validate.JWT_ACCESS_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.id) },
      include: { member: true },
    });

    const activeMember = user?.member[0];

    req.user = {
      id: decoded.id,
      role: activeMember?.role,
      schoolId: activeMember?.schoolId,
    };

    return next();
  } catch {
    return next();
  }
};
