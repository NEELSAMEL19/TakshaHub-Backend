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

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });

  static markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { classId, sectionId, date, attendance } = req.body;
    const result = await StudentAttendanceService.markAttendance(
      schoolId, classId, sectionId, date, attendance,
    );

    return res.status(201).json({
      success: true,
      message: `Attendance marked for ${result.total} students.`,
      data: result,
    });
  });

  static updateAttendance = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { studentId, date, status } = req.body;
    const result = await StudentAttendanceService.updateAttendance(
      schoolId, studentId, date, status,
    );

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      data: result,
    });
  });

  static getAttendanceByDate = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { classId, sectionId, date } = req.query as Record<string, string>;
    const data = await StudentAttendanceService.getAttendanceByDate(
      schoolId, classId, sectionId, date,
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });
}