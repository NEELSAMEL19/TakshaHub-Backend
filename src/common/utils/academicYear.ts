import prisma from "../../config/prisma.js";
import { AppError } from "../middlewares/AppError.js";

export async function getActiveAcademicYearId(
  schoolId: bigint,
): Promise<bigint> {
  const year = await prisma.academicYear.findFirst({
    where: {
      schoolId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!year) {
    throw new AppError("No active academic year set for this school.", 400);
  }

  return year.id;
}

export async function resolveAcademicYearId(
  schoolId: bigint,
  academicYearId?: bigint,
): Promise<bigint> {
  if (academicYearId) {
    const year = await prisma.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
      select: { id: true },
    });
    if (!year) {
      throw new AppError("Academic year not found for this school.", 404);
    }
    return year.id;
  }
  return getActiveAcademicYearId(schoolId);
}
