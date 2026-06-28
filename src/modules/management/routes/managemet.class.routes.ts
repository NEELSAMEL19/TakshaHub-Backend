import { Router } from "express";
import { ManagementClassController } from "../controller/managemet.class.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import { CreateClassWithSectionsSchema, UpdateClassSchema, DeleteClassSchema } from "../schema/managemet.class.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin); // Secure entire sub-routing layer globally

router.post("/create", validate(CreateClassWithSectionsSchema), ManagementClassController.createClass);
router.get("/all", ManagementClassController.getAllClasses);
router.get("/:classId", ManagementClassController.getClassById);
router.put("/update", validate(UpdateClassSchema), ManagementClassController.updateClass);
router.delete("/delete", validate(DeleteClassSchema), ManagementClassController.deleteClass);

export default router;