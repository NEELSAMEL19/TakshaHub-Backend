import { Router } from "express";
import { ManagementClassController } from "../controller/managemet.class.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  CreateClassWithSectionsSchema,
  UpdateClassWithSectionsSchema,
} from "../schema/managemet.class.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin); // Secure entire sub-routing layer globally

// -----------------------------------------------------------------------
// CLASS + SECTIONS ROUTES (unified)
// -----------------------------------------------------------------------

router.post(
  "/create",
  validate(CreateClassWithSectionsSchema),
  ManagementClassController.createClass,
);
router.get("/all", ManagementClassController.getAllClasses);
router.get("/class-dropdown", ManagementClassController.getClassesDropdown);
router.get("/section-dropdown/:classId",ManagementClassController.getSectionsDropdown);
router.put(
  "/:classId",
  validate(UpdateClassWithSectionsSchema),
  ManagementClassController.updateClass,
);
router.delete("/:classId", ManagementClassController.deleteClass);

// -----------------------------------------------------------------------
// SINGLE CLASS ROUTE (must stay below the more specific routes above,
// otherwise "/dropdown" or "/all" would be matched as a :classId param)
// -----------------------------------------------------------------------

router.get("/:classId", ManagementClassController.getClassById);

export default router;
