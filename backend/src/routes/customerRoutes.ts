import { Router } from "express"
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
  listCustomersQuerySchema,
} from "@app/shared"
import CustomerController from "../controllers/customerController"
import { authMiddleware } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

router.post(
  "/customers",
  authMiddleware,
  validate(createCustomerSchema),
  CustomerController.create
)

router.get(
  "/customers",
  authMiddleware,
  validate(listCustomersQuerySchema, "query"),
  CustomerController.list
)

router.get(
  "/customers/:id",
  authMiddleware,
  validate(customerIdParamSchema, "params"),
  CustomerController.getById
)

router.put(
  "/customers/:id",
  authMiddleware,
  validate(customerIdParamSchema, "params"),
  validate(updateCustomerSchema),
  CustomerController.update
)

router.delete(
  "/customers/:id",
  authMiddleware,
  validate(customerIdParamSchema, "params"),
  CustomerController.delete
)

export default router
