import { asyncHandler } from "../common/utils/utils.js";
import { AuthService } from "./auth.service.js";
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
};
export class AuthController {
    static register = asyncHandler(async (req, res) => {
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
    static login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await AuthService.login({ email, password });
        res.cookie("token", result.token, cookieOptions);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                user: result.user,
                auth: result.auth, // 🔥 ADD THIS
            },
        });
    });
    static me = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }
        const result = await AuthService.getCurrentUser(userId);
        return res.status(200).json({
            success: true,
            message: "Authenticated user fetched successfully",
            data: result, // 🔥 no extra nesting
        });
    });
    static logout = asyncHandler(async (_req, res) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });
        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    });
}
//# sourceMappingURL=auth.controller.js.map