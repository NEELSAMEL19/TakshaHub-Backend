import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { StudentAttendanceService } from "./attendance.students.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class StudentAttendanceController {
  static getStudentsForAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      // academicYearId is optional — omitted means "use active year" (default,
      // same as before). When the frontend's "Select Academic Year" dropdown
      // sends a specific year, that year's roster/attendance is returned instead.
      const { classId, sectionId, date, academicYearId } = req.query as Record<
        string,
        string
      >;
      const data = await StudentAttendanceService.getStudentsForAttendance(
        schoolId,
        classId,
        sectionId,
        date,
        academicYearId,
      );

      return res.status(200).json({ success: true, count: data.length, data });
    },
  );

  static toggleAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      // No academicYearId here by design — marking/toggling attendance is
      // always scoped to the active year only; past years are view-only.
      const { studentId, classId, sectionId, date, status } = req.body;
      const result = await StudentAttendanceService.upsertAttendance(
        schoolId,
        studentId,
        classId,
        sectionId,
        date,
        status,
      );

      return res.status(200).json({
        success: true,
        message:
          status === null ? "Attendance unmarked." : "Attendance updated.",
        data: result,
      });
    },
  );
}
