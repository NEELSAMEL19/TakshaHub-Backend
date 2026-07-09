import prisma from "../../config/prisma.js";
import { AppError } from "../middlewares/AppError.js";
import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export const serializeBigInt = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
};

export const asString = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

/**
 * Resolves the currently active academic year for a school.
 * Every enrollment/assignment/attendance read+write is scoped to this
 * unless a specific year is explicitly requested (e.g. viewing history).
 */
export async function getActiveAcademicYearId(
  schoolId: bigint,
): Promise<bigint> {
  const year = await prisma.academicYear.findFirst({
    where: { schoolId, isActive: true },
    select: { id: true },
  });
  if (!year) {
    throw new AppError("No active academic year set for this school.", 400);
  }
  return year.id;
}
