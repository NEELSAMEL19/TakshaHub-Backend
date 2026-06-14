import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.js";
import { validate } from "../../common/middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
} from "./auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.get("/me", authMiddleware, AuthController.me);
router.post("/logout", authMiddleware, AuthController.logout);
export default router;
