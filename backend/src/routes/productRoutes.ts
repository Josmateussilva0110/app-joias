import { Router } from "express"
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  listProductsQuerySchema,
} from "@app/shared"
import ProductController from "../controllers/productController"
import { authMiddleware } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

router.post(
  "/products",
  authMiddleware,
  validate(createProductSchema),
  ProductController.create
)

router.get(
  "/products",
  authMiddleware,
  validate(listProductsQuerySchema, "query"),
  ProductController.list
)

router.get(
  "/products/:id",
  authMiddleware,
  validate(productIdParamSchema, "params"),
  ProductController.getById
)

router.put(
  "/products/:id",
  authMiddleware,
  validate(productIdParamSchema, "params"),
  validate(updateProductSchema),
  ProductController.update
)

router.delete(
  "/products/:id",
  authMiddleware,
  validate(productIdParamSchema, "params"),
  ProductController.delete
)

export default router
