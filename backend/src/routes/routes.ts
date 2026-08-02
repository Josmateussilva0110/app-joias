import { Router } from "express"
const router = Router()

import userRoutes from "./userRoutes"
import productRoutes from "./productRoutes"
import customerRoutes from "./customerRoutes"
import notificationRoutes from "./notificationRoutes"

router.use(userRoutes)
router.use(productRoutes)
router.use(customerRoutes)
router.use(notificationRoutes)

export default router
