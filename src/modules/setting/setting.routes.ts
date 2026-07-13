import { Router } from "express";
import profileRouter from "./profile/setting.profile.routes.js";

const organizationModuleRouter = Router();

// Hook up sub-routers cleanly
organizationModuleRouter.use("/profile", profileRouter);

export default organizationModuleRouter;
