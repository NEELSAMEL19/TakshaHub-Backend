import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
type RequestSchema = {
    body?: unknown;
    query?: unknown;
    params?: unknown;
};
export declare const validate: <T extends RequestSchema>(schema: ZodType<T>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validate.d.ts.map