import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type RequestSchema = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

export const validate =
  <T extends RequestSchema>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      // ✅ convert array → object
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((e) => {
        const field = e.path.slice(1).join("."); // 👈 FIX
        fieldErrors[field] = e.message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors, // 👈 FIXED
      });
    }

    if ("body" in result.data) {
      req.body = result.data.body;
    }

    next();
  };
