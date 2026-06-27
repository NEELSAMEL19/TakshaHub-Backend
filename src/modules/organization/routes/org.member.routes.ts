import { Router } from "express";
import { OrgMemberController } from "../controllers/org.member.controller.js";
import { authMiddleware } from "../../../common/middlewares/auth.js";
import { isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import { AddMemberSchema, UpdateMemberSchema, DeleteMemberSchema } from "../schemas/org.member.schema.js";

const router = Router();

// Secure entire routing layer cluster globally for Admins
router.use(authMiddleware, isAdmin);

router.post("/add", validate(AddMemberSchema), OrgMemberController.addMember);
router.get("/all", OrgMemberController.getAllMembers);
router.get("/:id", authMiddleware, isAdmin, OrgMemberController.getMemberById);
router.put("/update", validate(UpdateMemberSchema), OrgMemberController.updateMember);
router.delete("/delete", validate(DeleteMemberSchema), OrgMemberController.deleteMember);

export default router;