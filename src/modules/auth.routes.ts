import { Router } from "express";
import { AuthController } from "./auth.controller.js"
import { validate } from "../common/middlewares/validate.js";
import { registerSchema } from "./auth.schema.js";

const router = Router();

router.post("/register",validate(registerSchema), AuthController.register)

export default router