export class AppError extends Error {
  public statusCode: number;
  public errors?: Record<string, string>; // 👈 NEW

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string> // 👈 NEW
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}