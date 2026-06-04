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
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    if ("body" in result.data) {
      req.body = result.data.body;
    }

    next();
  };
