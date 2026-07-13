import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { ProfileService } from "./setting.profile.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class ProfileController {
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized context scope missing.", 401);

    const data = await ProfileService.getProfile(userId);
    return res.status(200).json({ success: true, data });
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const schoolId = req.user?.schoolId;
    if (!userId || !schoolId)
      throw new AppError("Unauthorized context scope missing.", 401);

    const data = await ProfileService.updateProfile(userId, schoolId, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data,
    });
  });
}
