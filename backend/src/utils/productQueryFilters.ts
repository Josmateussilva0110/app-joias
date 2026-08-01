import { ListProductsQuery } from "@app/shared"

import { MIN_FILTER_YEAR } from "../constants/product.constants"

export type FilterableQuery = {
  eq: (column: string, value: unknown) => FilterableQuery
  ilike: (column: string, pattern: string) => FilterableQuery
  gte: (column: string, value: string | number) => FilterableQuery
  lte: (column: string, value: string | number) => FilterableQuery
  lt: (column: string, value: string) => FilterableQuery
  or: (filters: string) => FilterableQuery
}

export function getDateRange(filters: Pick<ListProductsQuery, "month" | "year">) {
  if (!filters.year) return null

  if (filters.month) {
    const start = new Date(filters.year, filters.month - 1, 1)
    const end = new Date(filters.year, filters.month, 1)
    return { start: start.toISOString(), end: end.toISOString() }
  }

  const start = new Date(filters.year, 0, 1)
  const end = new Date(filters.year + 1, 0, 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function applyListFilters<T>(
  query: T,
  filters: Pick<
    ListProductsQuery,
    "customer_name" | "jewelry_type" | "payment" | "month" | "year"
  >
): T {
  let next = query as FilterableQuery

  if (filters.jewelry_type) {
    next = next.ilike("jewelry_type", `%${filters.jewelry_type}%`)
  }

  if (filters.payment === "paid") {
    next = next.eq("payment_status", true)
  } else if (filters.payment === "unpaid") {
    next = next.eq("payment_status", false)
  }

  const dateRange = getDateRange(filters)
  if (dateRange) {
    next = next
      .gte("created_at", dateRange.start)
      .lt("created_at", dateRange.end)
  } else if (filters.month) {
    const currentYear = new Date().getFullYear()
    next = next
      .eq("created_month", filters.month)
      .gte("created_year", MIN_FILTER_YEAR)
      .lte("created_year", currentYear)
  } else if (filters.year) {
    next = next.eq("created_year", filters.year)
  }

  return next as T
}

export function toListMetaRpcParams(
  filters: Pick<
    ListProductsQuery,
    "customer_name" | "jewelry_type" | "payment" | "month" | "year"
  >
) {
  return {
    p_customer_name: filters.customer_name ?? null,
    p_jewelry_type: filters.jewelry_type ?? null,
    p_payment: filters.payment ?? "all",
    p_month: filters.month ?? null,
    p_year: filters.year ?? null,
  }
}
