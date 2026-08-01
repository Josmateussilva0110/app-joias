import { ListProductsQuery } from "@app/shared"

import {
  PRODUCT_BASE_SELECT,
  PRODUCT_SELECT,
} from "../constants/product.constants"
import { createSupabaseClientForUser } from "../database/supabase/supabase"
import { getUserIdFromAccessToken } from "./accessToken"
import {
  buildFilterCacheKey,
  filterOptionsCache,
  listMetaCache,
} from "./shortCache"
import { applyListFilters, toListMetaRpcParams } from "./productQueryFilters"
import { getAvailableYears } from "./productYears"

type ProductSupabaseClient = ReturnType<typeof createSupabaseClientForUser>

export type ProductListMeta = {
  summary_total: number
  has_any: boolean
  available_years: number[]
}

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

export async function fetchPageOneMeta(
  supabase: ProductSupabaseClient,
  accessToken: string,
  filters: ListProductsQuery
): Promise<ProductListMeta> {
  const userId = getUserIdFromAccessToken(accessToken)
  const cacheKey = userId
    ? buildFilterCacheKey(userId, toListMetaRpcParams(filters))
    : null

  if (cacheKey) {
    const cached = listMetaCache.get(cacheKey)
    if (cached) return cached
  }

  const { data, error } = await supabase.rpc(
    "get_my_products_list_meta",
    toListMetaRpcParams(filters)
  )

  if (error) {
    console.error("[ProductService.list.meta]", error)
    return {
      summary_total: 0,
      has_any: false,
      available_years: getAvailableYears([]),
    }
  }

  const meta = (data ?? {}) as ProductListMeta
  const result: ProductListMeta = {
    summary_total: Number(meta.summary_total ?? 0),
    has_any: Boolean(meta.has_any),
    available_years: getAvailableYears(
      Array.isArray(meta.available_years) ? meta.available_years : []
    ),
  }

  if (cacheKey) {
    listMetaCache.set(cacheKey, result)
  }

  return result
}

export async function fetchAvailableYears(
  supabase: ProductSupabaseClient,
  accessToken?: string
) {
  const userId = accessToken ? getUserIdFromAccessToken(accessToken) : undefined
  const cacheKey = userId ? `${userId}:years` : null

  if (cacheKey) {
    const cached = filterOptionsCache.get(cacheKey)
    if (cached) return getAvailableYears(cached.years)
  }

  const { data, error } = await supabase.rpc("get_my_product_years")

  if (error) {
    console.error("[ProductService.list.years]", error)
    return getAvailableYears([])
  }

  const years = (data ?? []).map((row: { year: number }) => row.year)
  const normalized = getAvailableYears(years)

  if (cacheKey) {
    const existing = filterOptionsCache.get(cacheKey)
    filterOptionsCache.set(cacheKey, {
      years: normalized,
      months: existing?.months ?? [],
    })
  }

  return normalized
}

export async function fetchAvailableMonths(
  supabase: ProductSupabaseClient,
  year?: number,
  accessToken?: string
) {
  const userId = accessToken ? getUserIdFromAccessToken(accessToken) : undefined
  const cacheKey = userId ? `${userId}:months:${year ?? "all"}` : null

  if (cacheKey) {
    const cached = filterOptionsCache.get(cacheKey)
    if (cached) return cached.months
  }

  const { data, error } = await supabase.rpc("get_my_product_months", {
    filter_year: year ?? null,
  })

  if (error) {
    console.error("[ProductService.filters.months]", error)
    return []
  }

  const months = (data ?? []).map((row: { month: number }) => row.month)

  if (cacheKey) {
    filterOptionsCache.set(cacheKey, { years: [], months })
  }

  return months
}

export function invalidateProductCaches(userId?: string): void {
  if (!userId) return
  listMetaCache.deleteByPrefix(`${userId}:`)
  filterOptionsCache.deleteByPrefix(`${userId}:`)
}
