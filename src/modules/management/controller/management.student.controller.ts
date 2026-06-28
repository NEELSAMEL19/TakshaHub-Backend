import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { ManagementStudentService } from "../service/management.student.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class ManagementStudentController {
  static getAvailableStudents = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      const data =
        await ManagementStudentService.getAvailableStudents(schoolId);

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    },
  );



  static getEnrolledStudents = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      const data = await ManagementStudentService.getEnrolledStudents(schoolId);

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    },
  );

  static enrollStudent = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { studentId, classId, sectionId } = req.body;
    const result = await ManagementStudentService.enrollStudent(
      schoolId,
      studentId,
      classId,
      sectionId,
    );

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully.",
      data: result,
    });
  });

  static unenrollStudent = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { studentId, classId } = req.body;
    await ManagementStudentService.unenrollStudent(
      schoolId,
      studentId,
      classId,
    );

    return res.status(200).json({
      success: true,
      message: "Student unenrolled successfully.",
    });
  });
}
