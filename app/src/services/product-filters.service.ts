import { ProductFilterOptions, ProductFiltersQueryDTO } from "@app/shared";
import { PRODUCT_ROUTES } from "@/config/api-routes";
import { requestData } from "./request";

export function getProductFilters(params: ProductFiltersQueryDTO = {}) {
  return requestData<ProductFilterOptions>({
    endpoint: PRODUCT_ROUTES.filters,
    method: "GET",
    params,
  });
}
