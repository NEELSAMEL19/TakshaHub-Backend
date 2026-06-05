import type { Request, Response } from "express";
export declare class AuthController {
    static register: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    static verifyOtp: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    static resendOtp: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    static login: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    static me: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    static logout: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
}
//# sourceMappingURL=auth.controller.d.ts.map