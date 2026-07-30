import { useQuery } from "@tanstack/react-query";
import { ProductAnalytics, ProductAnalyticsQueryDTO } from "@app/shared";

import { getProductAnalytics } from "@/services/product.service";
import { useAuth } from "./useAuth";
import { PRODUCTS_KEY } from "./use-products";

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

export const PRODUCT_ANALYTICS_KEY = "product-analytics";

export type ProductAnalyticsFilters = ProductAnalyticsQueryDTO;

export function useProductAnalytics(
  filters: ProductAnalyticsFilters | undefined,
  enabled = true
) {
  const { signed, loading } = useAuth();

  return useQuery<ProductAnalytics, QueryError>({
    queryKey: [PRODUCTS_KEY, PRODUCT_ANALYTICS_KEY, filters],
    enabled: signed && !loading && enabled && Boolean(filters),
    queryFn: async () => {
      const res = await getProductAnalytics(filters!);

      if (!res.success || !res.data) {
        const error = new Error(
          res.message || "Não foi possível carregar a análise."
        ) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data;
    },
    staleTime: 30 * 1000,
  });
}
