import { Router } from "express";
import calssRouter from "./routes/managemet.class.routes.js";

const managementModuleRouter = Router();

managementModuleRouter.use("/class", calssRouter);

export default managementModuleRouter;
