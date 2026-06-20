import { Router } from "express";
import { OrgClassController } from "../controllers/org.class.controller.js";
import { authMiddleware } from "../../../common/middlewares/auth.js";
import { isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import { CreateClassWithSectionsSchema, UpdateClassSchema, DeleteClassSchema } from "../schemas/org.class.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin); // Secure entire sub-routing layer globally

router.post("/create", validate(CreateClassWithSectionsSchema), OrgClassController.createClass);
router.get("/all", OrgClassController.getAllClasses);
router.put("/update", validate(UpdateClassSchema), OrgClassController.updateClass);
router.delete("/delete", validate(DeleteClassSchema), OrgClassController.deleteClass);

export default router;