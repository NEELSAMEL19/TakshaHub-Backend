import jwt from "jsonwebtoken";
import validate from "../../config/validate.js";
import { AppError } from "./AppError.js";
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next(new AppError("No token provided. Please login first.", 401));
        }
        const decoded = jwt.verify(token, validate.JWT_ACCESS_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role,
            schoolId: decoded.schoolId ? BigInt(decoded.schoolId) : undefined,
        };
        return next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError("Token expired. Please login again.", 401));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError("Invalid token", 401));
        }
        return next(error);
    }
};
//# sourceMappingURL=auth.js.map