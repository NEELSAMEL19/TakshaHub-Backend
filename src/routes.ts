
import {Router} from "express"
import authRoutes from "./modules/auth/auth.routes.js"
import sidebarRoutes from "./modules/sidebar/sidebar.routes.js"
import organizationRoutes from "./modules/organization/org.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/sidebar", sidebarRoutes)
router.use("/organization", organizationRoutes)

export default router