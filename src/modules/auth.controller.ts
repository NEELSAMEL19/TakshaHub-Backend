import type { Request, Response } from "express";
import { asyncHandler } from "../common/utils/utils.js";
import { AuthService } from "./auth.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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

    res.cookie("token", result.token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
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

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login({
      email,
      password,
    });

    res.cookie("token", result.token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const user = await AuthService.getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      message: "Authenticated user fetched successfully",
      data: {
        user,
      },
    });
  });

  static logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });
}
