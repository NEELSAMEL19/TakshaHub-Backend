import jwt from "jsonwebtoken";
import { AppError } from "./AppError.js";
import validate from "../../config/validate.js";
export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next(new AppError("No token provided. Please login first.", 401));
        }
        const decoded = jwt.verify(token, validate.JWT_ACCESS_SECRET);
        req.user = decoded;
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
export const optionalAuthMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            const decoded = jwt.verify(token, validate.JWT_ACCESS_SECRET);
            req.user = decoded;
        }
        return next();
    }
    catch {
        return next();
    }
};
//# sourceMappingURL=auth.js.map