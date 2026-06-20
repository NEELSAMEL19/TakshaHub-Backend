import { Router } from "express";
import roleRouter from "./routes/org.role.routes.js";
import calssRouter from "./routes/org.class.routes.js";
import memberRouter from "./routes/org.member.routes.js";


const organizationModuleRouter = Router();

// Hook up sub-routers cleanly
organizationModuleRouter.use("/roles", roleRouter);
organizationModuleRouter.use("/class", calssRouter);
organizationModuleRouter.use("/member", memberRouter);

export default organizationModuleRouter;
