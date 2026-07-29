import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateCustomerDTO, CustomerResponse } from "@app/shared";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
} from "@/services/customer.service";
import { PRODUCTS_KEY } from "@/hooks/use-products";
import { useAuth } from "./useAuth";

export const CUSTOMERS_KEY = ["customers"] as const;

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

export function useCustomers() {
  const { signed, loading } = useAuth();

  return useQuery<CustomerResponse[], QueryError>({
    queryKey: CUSTOMERS_KEY,
    enabled: signed && !loading,
    queryFn: async () => {
      const res = await listCustomers();

      if (!res.success) {
        const error = new Error(res.message) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data ?? [];
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
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
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
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
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
