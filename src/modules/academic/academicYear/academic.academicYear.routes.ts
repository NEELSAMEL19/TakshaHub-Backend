import { Router } from "express";
import { AcademicYearController } from "./academic.academicYear.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  CreateAcademicYearSchema,
  UpdateAcademicYearSchema,
  AcademicYearIdParamSchema,
} from "./academic.academicYear.schema.js";

const router = Router();
router.use(authMiddleware, isAdmin);

router.post("/add", validate(CreateAcademicYearSchema), AcademicYearController.create);
router.get("/all", AcademicYearController.getAll);
router.get("/:id", validate(AcademicYearIdParamSchema), AcademicYearController.getById);
router.put("/:id", validate(UpdateAcademicYearSchema), AcademicYearController.update);
router.patch("/:id/activate", validate(AcademicYearIdParamSchema), AcademicYearController.activate);
router.delete("/:id", validate(AcademicYearIdParamSchema), AcademicYearController.remove);

export default router;