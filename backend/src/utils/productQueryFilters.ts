import { ListProductsQuery } from "@app/shared"

import { MIN_FILTER_YEAR } from "../constants/product.constants"

export type FilterableQuery = {
  eq: (column: string, value: unknown) => FilterableQuery
  ilike: (column: string, pattern: string) => FilterableQuery
  gte: (column: string, value: string) => FilterableQuery
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

function applyMonthOnlyFilter(query: FilterableQuery, month: number) {
  const currentYear = new Date().getFullYear()
  const ranges: string[] = []

  for (let year = MIN_FILTER_YEAR; year <= currentYear; year += 1) {
    const start = new Date(year, month - 1, 1).toISOString()
    const end = new Date(year, month, 1).toISOString()
    ranges.push(`and(created_at.gte.${start},created_at.lt.${end})`)
  }

  return query.or(ranges.join(","))
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
    next = applyMonthOnlyFilter(next, filters.month)
  }

  return next as T
}
