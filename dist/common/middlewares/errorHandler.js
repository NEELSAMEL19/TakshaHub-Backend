import { AppError } from "./AppError.js";
const errorHandler = (err, req, res, next) => {
    console.error(err);
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const message = isAppError
        ? err.message
        : err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        message,
    });
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map