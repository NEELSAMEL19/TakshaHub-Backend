import { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { ManagementClassTeacherService } from "./management.classTeacher.service.js";
import { asString } from "../../../common/utils/utils.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class ManagementClassTeacherController {
  static getClassTeachers = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);

      const classTeachers =
        await ManagementClassTeacherService.getClassTeachers(schoolId);

      res.status(200).json({ success: true, data: classTeachers });
    },
  );

  static getClassTeacherBySection = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);

      const sectionId = asString(req.params.sectionId);
      if (!sectionId) throw new AppError("Section id is required.", 400);

      const classTeacher =
        await ManagementClassTeacherService.getClassTeacherBySection(
          schoolId,
          sectionId,
        );

      res.status(200).json({ success: true, data: classTeacher });
    },
  );

  static assignClassTeacher = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);
      const { teacherId, classId, sectionId } = req.body;

      const classTeacher =
        await ManagementClassTeacherService.assignClassTeacher(
          schoolId,
          teacherId,
          classId,
          sectionId,
        );

      res.status(200).json({ success: true, data: classTeacher });
    },
  );

  static unassignClassTeacher = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized.", 401);

      const sectionId = asString(req.params.sectionId);
      if (!sectionId) throw new AppError("Section id is required.", 400);

      const result = await ManagementClassTeacherService.unassignClassTeacher(
        schoolId,
        sectionId,
      );

      res.status(200).json({ success: true, data: result });
    },
  );
}
