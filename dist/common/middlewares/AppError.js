export class AppError extends Error {
    statusCode;
    errors; // 👈 NEW
    constructor(message, statusCode = 500, errors // 👈 NEW
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=AppError.js.map