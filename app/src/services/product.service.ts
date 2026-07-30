import {
  CreateProductDTO,
  ListProductsQueryDTO,
  ProductListResult,
  ProductResponse,
  UpdateProductDTO,
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

export function getProduct(id: string) {
  return requestData<ProductResponse>({
    endpoint: `${PRODUCT_ROUTES.list}/${id}`,
    method: "GET",
  });
}

export function createProduct(data: CreateProductDTO) {
  return requestData<{ id: string }>({
    endpoint: PRODUCT_ROUTES.create,
    method: "POST",
    data,
  });
}

export function updateProduct(id: string, data: UpdateProductDTO) {
  return requestData<ProductResponse>({
    endpoint: `${PRODUCT_ROUTES.list}/${id}`,
    method: "PUT",
    data,
  });
}

export function deleteProduct(id: string) {
  return requestData({
    endpoint: `${PRODUCT_ROUTES.list}/${id}`,
    method: "DELETE",
  });
}
