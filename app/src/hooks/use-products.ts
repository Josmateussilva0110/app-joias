import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateProductDTO,
  ListProductsQueryDTO,
  ProductListResult,
} from "@app/shared";
import { createProduct, listProducts } from "@/services/product.service";
import { useAuth } from "./useAuth";

export const PRODUCTS_KEY = "products";

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

export function useProducts(filters: ListProductsQueryDTO) {
  const { signed, loading } = useAuth();

  return useQuery<ProductListResult, QueryError>({
    queryKey: [PRODUCTS_KEY, filters],
    enabled: signed && !loading,
    queryFn: async () => {
      const res = await listProducts(filters);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data as ProductListResult;
    },
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, QueryError, CreateProductDTO>({
    mutationFn: async (data) => {
      const res = await createProduct(data);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data as { id: string };
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}
