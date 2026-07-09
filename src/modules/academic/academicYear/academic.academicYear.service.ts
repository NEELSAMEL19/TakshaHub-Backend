import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";

export class AcademicYearService {
  /**
   * CREATE: Add a new academic year for a school.
   * Does NOT auto-activate — must be explicitly activated via
   * setActiveAcademicYear, so switching years is always a deliberate
   * admin action, never accidental.
   */
  static async createAcademicYear(
    schoolId: string | bigint,
    label: string,
    startDate: string,
    endDate: string,
  ) {
    const sId = BigInt(schoolId);
    const formattedLabel = label.trim();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new AppError("startDate must be before endDate.", 400);
    }

    const existing = await prisma.academicYear.findUnique({
      where: { schoolId_label: { schoolId: sId, label: formattedLabel } },
    });
    if (existing) {
      throw new AppError(
        `Academic year '${formattedLabel}' already exists.`,
        409,
      );
    }

    const year = await prisma.academicYear.create({
      data: {
        schoolId: sId,
        label: formattedLabel,
        startDate: start,
        endDate: end,
        isActive: false,
      },
    });

    return serializeBigInt(year);
  }

  /**
   * READ: List all academic years for a school, most recent first.
   */
  static async getAcademicYears(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const years = await prisma.academicYear.findMany({
      where: { schoolId: sId },
      orderBy: { startDate: "desc" },
    });

    return serializeBigInt(years);
  }

  /**
   * READ: Get a single academic year by ID.
   */
  static async getAcademicYearById(
    schoolId: string | bigint,
    id: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const yearId = BigInt(id);

    const year = await prisma.academicYear.findFirst({
      where: { id: yearId, schoolId: sId },
    });

    if (!year) throw new AppError("Academic year not found.", 404);

    return serializeBigInt(year);
  }

  /**
   * UPDATE: Activate an academic year. Deactivates any other active year
   * for the same school in the same transaction, so exactly one year is
   * ever active at a time (Prisma has no partial-unique-index support,
   * so this invariant is enforced here rather than at the DB level).
   */
  static async setActiveAcademicYear(
    schoolId: string | bigint,
    id: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const yearId = BigInt(id);

    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.academicYear.findFirst({
        where: { id: yearId, schoolId: sId },
      });
      if (!target) throw new AppError("Academic year not found.", 404);

      if (target.isActive) {
        return target;
      }

      await tx.academicYear.updateMany({
        where: { schoolId: sId, isActive: true },
        data: { isActive: false },
      });

      return tx.academicYear.update({
        where: { id: yearId },
        data: { isActive: true },
      });
    });

    return serializeBigInt(result);
  }

  /**
   * UPDATE: Edit a year's label or date range. Does not touch isActive —
   * use setActiveAcademicYear for that.
   */
  static async updateAcademicYear(
    schoolId: string | bigint,
    id: string | bigint,
    label: string,
    startDate: string,
    endDate: string,
  ) {
    const sId = BigInt(schoolId);
    const yearId = BigInt(id);
    const formattedLabel = label.trim();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new AppError("startDate must be before endDate.", 400);
    }

    const target = await prisma.academicYear.findFirst({
      where: { id: yearId, schoolId: sId },
    });
    if (!target) throw new AppError("Academic year not found.", 404);

    if (formattedLabel !== target.label) {
      const nameTaken = await prisma.academicYear.findUnique({
        where: { schoolId_label: { schoolId: sId, label: formattedLabel } },
      });
      if (nameTaken) {
        throw new AppError(
          `Academic year '${formattedLabel}' already exists.`,
          409,
        );
      }
    }

    const updated = await prisma.academicYear.update({
      where: { id: yearId },
      data: { label: formattedLabel, startDate: start, endDate: end },
    });

    return serializeBigInt(updated);
  }

  /**
   * DELETE: Remove an academic year. Blocked if it's active, or if any
   * enrollment/assignment/attendance history references it (Restrict FK
   * on all five dependent tables) — years accumulate history and are
   * effectively permanent once used.
   */
  static async deleteAcademicYear(
    schoolId: string | bigint,
    id: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const yearId = BigInt(id);

    const target = await prisma.academicYear.findFirst({
      where: { id: yearId, schoolId: sId },
    });
    if (!target) throw new AppError("Academic year not found.", 404);

    if (target.isActive) {
      throw new AppError(
        "Cannot delete the active academic year. Activate a different year first.",
        409,
      );
    }

    const [
      enrollmentCount,
      assignmentCount,
      classTeacherCount,
      attendanceCount,
      teacherAttendanceCount,
    ] = await Promise.all([
      prisma.studentEnrollment.count({ where: { academicYearId: yearId } }),
      prisma.teacherAssignment.count({ where: { academicYearId: yearId } }),
      prisma.classTeacher.count({ where: { academicYearId: yearId } }),
      prisma.studentAttendance.count({ where: { academicYearId: yearId } }),
      prisma.teacherAttendance.count({ where: { academicYearId: yearId } }),
    ]);

    if (
      enrollmentCount ||
      assignmentCount ||
      classTeacherCount ||
      attendanceCount ||
      teacherAttendanceCount
    ) {
      throw new AppError(
        "Cannot delete an academic year with existing enrollment, assignment, or attendance history.",
        409,
      );
    }

    await prisma.academicYear.delete({ where: { id: yearId } });

    return { deleted: true };
  }
}
