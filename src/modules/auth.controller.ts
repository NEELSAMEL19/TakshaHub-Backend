import type { Request, Response } from "express";
import { asyncHandler } from "../common/utils/utils";
import { AuthService } from "./auth.service";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password, phoneNumber, school } = req.body;

    const result = await AuthService.register({
      fullName,
      email,
      password,
      phoneNumber,
      school,
    });

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  });
}
