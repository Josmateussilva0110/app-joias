import {
  CreateProductDTO,
  ListProductsQueryDTO,
  ProductListResult,
} from "@app/shared";
import { PRODUCT_ROUTES } from "@/config/api-routes";
import { requestData } from "./request";

export function listProducts(filters: ListProductsQueryDTO = {}) {
  return requestData<ProductListResult>({
    endpoint: PRODUCT_ROUTES.list,
    method: "GET",
    params: filters,
  });
}

export function createProduct(data: CreateProductDTO) {
  return requestData<{ id: string }>({
    endpoint: PRODUCT_ROUTES.create,
    method: "POST",
    data,
  });
}
