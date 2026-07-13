import { Router } from "express";
import { ProfileController } from "./setting.profile.controller.js";
import { authMiddleware } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import { UpdateProfileSchema } from "./setting.profile.schema.js";

const router = Router();

// Any authenticated user (not admin-only) can access their own profile
router.use(authMiddleware);

router.get("/me", ProfileController.getProfile);
router.put(
  "/update",
  validate(UpdateProfileSchema),
  ProfileController.updateProfile,
);

export default router;
