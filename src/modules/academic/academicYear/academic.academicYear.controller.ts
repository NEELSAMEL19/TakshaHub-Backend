import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { AcademicYearService } from "./academic.academicYear.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

function asString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class AcademicYearController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { label, startDate, endDate } = req.body;
    const data = await AcademicYearService.createAcademicYear(
      schoolId,
      label,
      startDate,
      endDate,
    );

    return res
      .status(201)
      .json({ success: true, message: "Academic year created.", data });
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const data = await AcademicYearService.getAcademicYears(schoolId);
    return res.status(200).json({ success: true, count: data.length, data });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const id = asString(req.params.id);
    const data = await AcademicYearService.getAcademicYearById(schoolId, id);
    return res.status(200).json({ success: true, data });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const id = asString(req.params.id);
    const { label, startDate, endDate } = req.body;
    const data = await AcademicYearService.updateAcademicYear(
      schoolId,
      id,
      label,
      startDate,
      endDate,
    );

    return res
      .status(200)
      .json({ success: true, message: "Academic year updated.", data });
  });

  static activate = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const id = asString(req.params.id);
    const data = await AcademicYearService.setActiveAcademicYear(schoolId, id);

    return res
      .status(200)
      .json({ success: true, message: "Academic year activated.", data });
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const id = asString(req.params.id);
    const data = await AcademicYearService.deleteAcademicYear(schoolId, id);

    return res
      .status(200)
      .json({ success: true, message: "Academic year deleted.", data });
  });
}
