import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { StudentAttendanceService } from "./attendance.students.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class StudentAttendanceController {
  static getStudentsForAttendance = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { classId, sectionId, date } = req.query as Record<string, string>;
    const data = await StudentAttendanceService.getStudentsForAttendance(
      schoolId, classId, sectionId, date,
    );

    return res.status(200).json({ success: true, count: data.length, data });
  });

  static toggleAttendance = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { studentId, classId, sectionId, date, status } = req.body;
    const result = await StudentAttendanceService.upsertAttendance(
      schoolId, studentId, classId, sectionId, date, status,
    );

    return res.status(200).json({
      success: true,
      message: status === null ? "Attendance unmarked." : "Attendance updated.",
      data: result,
    });
  });
}