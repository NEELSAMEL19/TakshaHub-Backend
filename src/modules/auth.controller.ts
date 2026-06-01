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

  static verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const result = await AuthService.verifyOtp({
      email,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  });

  static resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await AuthService.resendOtp({
      email,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  });
}
