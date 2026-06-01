import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../common/middlewares/validate.js";
import { registerSchema, resendOtpSchema, verifyOtpSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), AuthController.resendOtp);

export default router;
