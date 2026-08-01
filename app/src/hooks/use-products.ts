import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreateProductDTO,
  ListProductsQueryDTO,
  ProductListResult,
  ProductResponse,
  PRODUCTS_PAGE_SIZE,
  UpdateProductDTO,
} from "@app/shared";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "@/services/product.service";
import { useAuth } from "./useAuth";

export const PRODUCTS_KEY = "products";
export const PRODUCT_FILTERS_KEY = "product-filters";

export function productDetailKey(productId: string) {
  return [PRODUCTS_KEY, productId] as const;
}

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

export type ProductsListFilters = Omit<ListProductsQueryDTO, "page" | "limit">;

export function useProducts(
  filters: ProductsListFilters | undefined,
  enabled = true
) {
  const { signed, loading } = useAuth();

  return useInfiniteQuery<ProductListResult, QueryError>({
    queryKey: [PRODUCTS_KEY, filters],
    enabled: signed && !loading && enabled && Boolean(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await listProducts({
        ...filters,
        page: pageParam,
        limit: PRODUCTS_PAGE_SIZE,
      });

      if (!res.success || !res.data?.items) {
        const error = new Error(
          res.message || "Não foi possível carregar as vendas."
        ) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useProduct(productId: string) {
  const { signed, loading } = useAuth();

  return useQuery<ProductResponse, QueryError>({
    queryKey: productDetailKey(productId),
    enabled: signed && !loading && Boolean(productId),
    queryFn: async () => {
      const res = await getProduct(productId);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data as ProductResponse;
    },
    staleTime: 30 * 1000,
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
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, PRODUCT_FILTERS_KEY] });
    },
  });
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, QueryError, UpdateProductDTO>({
    mutationFn: async (data) => {
      const res = await updateProduct(productId, data);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data as { id: string };
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: productDetailKey(productId) });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, PRODUCT_FILTERS_KEY] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<void, QueryError, string>({
    mutationFn: async (productId) => {
      const res = await deleteProduct(productId);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }
    },
    onSuccess(_data, productId) {
      queryClient.removeQueries({ queryKey: productDetailKey(productId) });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, PRODUCT_FILTERS_KEY] });
    },
  });
}
