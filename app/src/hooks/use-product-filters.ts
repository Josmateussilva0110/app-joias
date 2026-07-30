import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductFilterOptions } from "@app/shared";

import { getProductFilters } from "@/services/product-filters.service";
import { useAuth } from "./useAuth";
import { PRODUCTS_KEY, PRODUCT_FILTERS_KEY } from "./use-products";
import type { ProductFilters } from "@/features/products/utils/filter-products";

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

function toProductFilters(defaults: ProductFilterOptions["defaults"]): ProductFilters {
  return {
    payment: defaults.payment,
    year: defaults.year,
    month: defaults.month,
    customerName: "",
    jewelryName: "",
  };
}

export function useProductFilters(year?: number | null) {
  const { signed, loading } = useAuth();

  return useQuery<ProductFilterOptions, QueryError>({
    queryKey: [PRODUCTS_KEY, PRODUCT_FILTERS_KEY, year ?? "all"],
    enabled: signed && !loading,
    queryFn: async () => {
      const res = await getProductFilters({
        year: year ?? undefined,
      });

      if (!res.success || !res.data) {
        const error = new Error(
          res.message || "Não foi possível carregar os filtros."
        ) as QueryError;
        error.status = res.error?.status;
        error.reason = res.error?.reason;
        throw error;
      }

      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useProductFiltersState() {
  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const {
    data: filterOptions,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductFilters(filters?.year);

  useEffect(() => {
    if (filterOptions && filters === null) {
      setFilters(toProductFilters(filterOptions.defaults));
    }
  }, [filterOptions, filters]);

  useEffect(() => {
    if (!filterOptions || !filters || filters.month === null) {
      return;
    }

    const monthExists = filterOptions.months.some(
      (option) => option.value === filters.month
    );

    if (!monthExists) {
      setFilters((current) =>
        current ? { ...current, month: null } : current
      );
    }
  }, [filterOptions, filters]);

  return {
    filters,
    setFilters,
    filterOptions,
    isLoading: isLoading || filters === null,
    isError,
    error,
    refetch,
  };
}
