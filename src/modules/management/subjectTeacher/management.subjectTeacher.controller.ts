import { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { ManagementSubjectTeacherService } from "./management.subjectTeacher.service.js";
import { asString } from "../../../common/utils/utils.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class ManagementSubjectTeacherController {
  static getSubjectTeachers = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);

      const assignments =
        await ManagementSubjectTeacherService.getSubjectTeachers(schoolId);

      res.status(200).json({ success: true, data: assignments });
    },
  );

  static getSubjectTeachersBySection = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);

      const sectionId = asString(req.params.sectionId);
      if (!sectionId) throw new AppError("Section id is required.", 400);

      const assignments =
        await ManagementSubjectTeacherService.getSubjectTeachersBySection(
          schoolId,
          sectionId,
        );

      res.status(200).json({ success: true, data: assignments });
    },
  );

  static assignSubjectTeacher = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);

      const { teacherId, classId, sectionId, subjectId } = req.body;

      const assignment =
        await ManagementSubjectTeacherService.assignSubjectTeacher(
          schoolId,
          teacherId,
          classId,
          sectionId,
          subjectId,
        );

      res.status(200).json({ success: true, data: assignment });
    },
  );

  static unassignSubjectTeacher = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);

      const { teacherId, classId, sectionId, subjectId } = req.body;

      const result =
        await ManagementSubjectTeacherService.unassignSubjectTeacher(
          schoolId,
          teacherId,
          classId,
          sectionId,
          subjectId,
        );

      res.status(200).json({ success: true, data: result });
    },
  );
}