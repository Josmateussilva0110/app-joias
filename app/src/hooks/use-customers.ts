import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreateCustomerDTO,
  CustomerListResult,
  CustomerResponse,
  CUSTOMERS_PAGE_SIZE,
  CUSTOMERS_PICKER_LIMIT,
  UpdateCustomerDTO,
} from "@app/shared";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "@/services/customer.service";
import { PRODUCTS_KEY } from "@/hooks/use-products";
import { useAuth } from "./useAuth";

export const CUSTOMERS_KEY = "customers";

export function customerDetailKey(customerId: string) {
  return [CUSTOMERS_KEY, customerId] as const;
}

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

export type CustomersListFilters = {
  name?: string;
};

export function useCustomers(filters?: CustomersListFilters) {
  const { signed, loading } = useAuth();

  return useInfiniteQuery<CustomerListResult, QueryError>({
    queryKey: [CUSTOMERS_KEY, filters],
    enabled: signed && !loading,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await listCustomers({
        ...filters,
        page: pageParam,
        limit: CUSTOMERS_PAGE_SIZE,
      });

      if (!res.success || !res.data?.items) {
        const error = new Error(
          res.message || "Não foi possível carregar os clientes."
        ) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
  });
}

/** Carrega clientes para o seletor do formulário de venda (limite maior, uma página). */
export function useCustomerPicker() {
  const { signed, loading } = useAuth();

  return useQuery<CustomerResponse[], QueryError>({
    queryKey: [CUSTOMERS_KEY, "picker"],
    enabled: signed && !loading,
    queryFn: async () => {
      const res = await listCustomers({ page: 1, limit: CUSTOMERS_PICKER_LIMIT });

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data?.items ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useCustomer(customerId: string) {
  const { signed, loading } = useAuth();

  return useQuery<CustomerResponse, QueryError>({
    queryKey: customerDetailKey(customerId),
    enabled: signed && !loading && Boolean(customerId),
    queryFn: async () => {
      const res = await getCustomer(customerId);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data as CustomerResponse;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, QueryError, CreateCustomerDTO>({
    mutationFn: async (data) => {
      const res = await createCustomer(data);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data as { id: string };
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
}

export function useUpdateCustomer(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, QueryError, UpdateCustomerDTO>({
    mutationFn: async (data) => {
      const res = await updateCustomer(customerId, data);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data as { id: string };
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: customerDetailKey(customerId) });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation<void, QueryError, string>({
    mutationFn: async (customerId) => {
      const res = await deleteCustomer(customerId);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }
    },
    onSuccess(_data, customerId) {
      queryClient.removeQueries({ queryKey: customerDetailKey(customerId) });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}

export function buildCustomerOptions(customers: CustomerResponse[]) {
  return customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));
}
