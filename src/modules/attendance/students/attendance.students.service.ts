import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import {
  getActiveAcademicYearId,
  resolveAcademicYearId,
} from "../../../common/utils/academicYear.js";
import { AttendanceStatus } from "@prisma/client";

export class StudentAttendanceService {
  /**
   * READ: Get roster for a school, optionally scoped to a class+section,
   * with attendance status for a given date, within a given academic
   * year. status: null means not marked yet.
   * classId/sectionId are optional — when omitted, returns the roster
   * across the whole school ("All" view). Each row carries its own
   * classId/sectionId so the frontend knows what context to send back
   * when toggling attendance for that student.
   *
   * academicYearId is optional — when omitted, defaults to the school's
   * currently active year (same behavior as before). When provided
   * (e.g. from a "Select Academic Year" dropdown), the roster and
   * attendance are read from that year instead, so past/inactive years
   * can be viewed. This method is READ-ONLY with respect to year choice —
   * marking/toggling attendance is still restricted to the active year
   * only, in upsertAttendance below.
   */
  static async getStudentsForAttendance(
    schoolId: string | bigint,
    classId: string | bigint | undefined,
    sectionId: string | bigint | undefined,
    date: string,
    academicYearId?: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const ayId = await resolveAcademicYearId(
      sId,
      academicYearId ? BigInt(academicYearId) : undefined,
    );
    const cId = classId ? BigInt(classId) : undefined;
    const secId = sectionId ? BigInt(sectionId) : undefined;
    const parsedDate = new Date(date);

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId: sId,
        academicYearId: ayId,
        ...(cId ? { classId: cId } : {}),
        ...(secId ? { sectionId: secId } : {}),
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { student: { fullName: "asc" } },
    });

    // Empty roster is a valid state (e.g. no enrollments yet), not an error.
    if (enrollments.length === 0) {
      return [];
    }

    const existingAttendance = await prisma.studentAttendance.findMany({
      where: {
        schoolId: sId,
        academicYearId: ayId,
        ...(cId ? { classId: cId } : {}),
        ...(secId ? { sectionId: secId } : {}),
        date: parsedDate,
      },
    });

    const attendanceMap = new Map(
      existingAttendance.map((a) => [a.studentId.toString(), a.status]),
    );

    return enrollments.map((e) => ({
      studentId: e.studentId.toString(),
      // Always return per-row classId/sectionId — required for the
      // toggle mutation to know the correct context in "All" mode,
      // where there's no single page-level class/section selected.
      classId: e.classId.toString(),
      sectionId: e.sectionId.toString(),
      fullName: e.student.fullName,
      email: e.student.email,
      status: attendanceMap.get(e.studentId.toString()) ?? null,
    }));
  }

  /**
   * TOGGLE: Single-row upsert (or delete when cycling back to unmarked).
   * The only write operation — fires per click on the status circle.
   * Always requires a concrete classId/sectionId, since a write must
   * know exactly which enrollment context it belongs to. Scoped to the
   * active academic year — attendance can't be marked against a stale
   * enrollment from a previous year. Deliberately does NOT accept an
   * academicYearId override: past/inactive years are view-only, so
   * historical attendance can't be accidentally edited.
   */
  static async upsertAttendance(
    schoolId: string | bigint,
    studentId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
    date: string,
    status: AttendanceStatus | null,
  ) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);
    const stId = BigInt(studentId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);
    const parsedDate = new Date(date);

    const targetClass = await prisma.class.findFirst({
      where: { id: cId, schoolId: sId },
    });
    if (!targetClass) throw new AppError("Class not found.", 404);

    const section = await prisma.section.findFirst({
      where: { id: secId, classId: cId },
    });
    if (!section) throw new AppError("Section not found.", 404);

    const enrolled = await prisma.studentEnrollment.findFirst({
      where: {
        studentId: stId,
        classId: cId,
        sectionId: secId,
        schoolId: sId,
        academicYearId,
      },
    });
    if (!enrolled) {
      throw new AppError(
        "Student is not enrolled in this class/section for the current academic year.",
        400,
      );
    }

    if (status === null) {
      await prisma.studentAttendance.deleteMany({
        where: { studentId: stId, date: parsedDate, academicYearId },
      });
      return {
        studentId: stId.toString(),
        classId: cId.toString(),
        sectionId: secId.toString(),
        date,
        status: null,
      };
    }

    const updated = await prisma.studentAttendance.upsert({
      where: { studentId_date: { studentId: stId, date: parsedDate } },
      update: { status, classId: cId, sectionId: secId, academicYearId },
      create: {
        studentId: stId,
        classId: cId,
        sectionId: secId,
        schoolId: sId,
        academicYearId,
        date: parsedDate,
        status,
      },
    });

    return serializeBigInt(updated);
  }
}
  