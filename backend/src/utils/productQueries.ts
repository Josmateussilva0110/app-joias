import { ListProductsQuery } from "@app/shared"

import {
  PRODUCT_BASE_SELECT,
  PRODUCT_SELECT,
} from "../constants/product.constants"
import { createSupabaseClientForUser } from "../database/supabase/supabase"
import { applyListFilters } from "./productQueryFilters"
import { getAvailableYears } from "./productYears"

type ProductSupabaseClient = ReturnType<typeof createSupabaseClientForUser>

export function buildItemsQuery(
  supabase: ProductSupabaseClient,
  filters: ListProductsQuery
) {
  const selectQuery = filters.customer_name
    ? `${PRODUCT_BASE_SELECT}, customers!inner(name)`
    : PRODUCT_SELECT

  let query = supabase.from("products").select(selectQuery, { count: "exact" })

  if (filters.customer_name) {
    query = query.ilike("customers.name", `%${filters.customer_name}%`)
  }

  query = applyListFilters(query, filters)

  return query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
}

export async function fetchFilteredSummaryTotal(
  supabase: ProductSupabaseClient,
  filters: ListProductsQuery
) {
  const { data, error } = filters.customer_name
    ? await applyListFilters(
        supabase
          .from("products")
          .select("value, customers!inner(name)")
          .ilike("customers.name", `%${filters.customer_name}%`),
        filters
      )
    : await applyListFilters(
        supabase.from("products").select("value"),
        filters
      )

  if (error) {
    console.error("[ProductService.list.summary]", error)
    return 0
  }

  return (data ?? []).reduce((sum, row) => {
    const value =
      typeof row.value === "string" ? Number(row.value) : Number(row.value ?? 0)
    return sum + (Number.isFinite(value) ? value : 0)
  }, 0)
}

export async function fetchAvailableYears(supabase: ProductSupabaseClient) {
  const { data, error } = await supabase.rpc("get_my_product_years")

  if (error) {
    console.error("[ProductService.list.years]", error)
    return getAvailableYears([])
  }

  const years = (data ?? []).map((row: { year: number }) => row.year)
  return getAvailableYears(years)
}

export async function fetchAvailableMonths(
  supabase: ProductSupabaseClient,
  year?: number
) {
  const { data, error } = await supabase.rpc("get_my_product_months", {
    filter_year: year ?? null,
  })

  if (error) {
    console.error("[ProductService.filters.months]", error)
    return []
  }

  return (data ?? []).map((row: { month: number }) => row.month)
}
