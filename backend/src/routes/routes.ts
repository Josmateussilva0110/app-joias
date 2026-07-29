import { Router } from "express"
const router = Router()

import userRoutes from "./userRoutes"
import productRoutes from "./productRoutes"
import customerRoutes from "./customerRoutes"

router.use(userRoutes)
router.use(productRoutes)
router.use(customerRoutes)

export default router
