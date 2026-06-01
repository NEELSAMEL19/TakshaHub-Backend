import type { NextFunction, Request, Response } from "express";

export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};


export const serializeBigInt = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};
