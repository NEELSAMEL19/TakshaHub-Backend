
import {Router} from "express"
import authRoutes from "./modules/auth/auth.routes.js"
import sidebarRoutes from "./modules/sidebar/sidebar.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/sidebar", sidebarRoutes)

export default router