import {
  CreateProductDTO,
  ListProductsQuery,
  ProductAnalytics,
  ProductAnalyticsQuery,
  ProductFilterOptions,
  ProductFiltersQuery,
  ProductListResult,
  ProductResponse,
  PRODUCTS_PAGE_SIZE,
  UpdateProductDTO,
  mapProductRow,
} from "@app/shared"
import { createSupabaseClientForUser } from "../database/supabase/supabase"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { ProductErrorCode } from "../types/code/productCode"
import {
  AnalyticsSourceRow,
  buildProductAnalytics,
} from "./productAnalytics"
import { buildProductFilterOptions } from "./productFilterOptions"

const PRODUCT_BASE_SELECT =
  "id, created_by, customer_id, jewelry_type, value, payment_status, created_at, updated_at"

const PRODUCT_SELECT = `${PRODUCT_BASE_SELECT}, customers(name)`

const MIN_FILTER_YEAR = 2026

type FilterableQuery = {
  eq: (column: string, value: unknown) => FilterableQuery
  ilike: (column: string, pattern: string) => FilterableQuery
  gte: (column: string, value: string) => FilterableQuery
  lt: (column: string, value: string) => FilterableQuery
  or: (filters: string) => FilterableQuery
}

function getAvailableYears(years: number[]) {
  const currentYear = new Date().getFullYear()
  const sortedYears = years.filter((year) => year >= MIN_FILTER_YEAR).sort((a, b) => b - a)

  if (sortedYears.length === 0 && currentYear >= MIN_FILTER_YEAR) {
    return [currentYear]
  }

  return sortedYears
}

function getDateRange(filters: Pick<ListProductsQuery, "month" | "year">) {
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

function applyListFilters<T>(
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

function buildItemsQuery(
  supabase: ReturnType<typeof createSupabaseClientForUser>,
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

  return query.order("created_at", {
    ascending: false,
  })
}

async function fetchFilteredSummaryTotal(
  supabase: ReturnType<typeof createSupabaseClientForUser>,
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

async function fetchAvailableYears(
  supabase: ReturnType<typeof createSupabaseClientForUser>
) {
  const { data, error } = await supabase.rpc("get_my_product_years")

  if (error) {
    console.error("[ProductService.list.years]", error)
    return getAvailableYears([])
  }

  const years = (data ?? []).map((row: { year: number }) => row.year)
  return getAvailableYears(years)
}

async function fetchAvailableMonths(
  supabase: ReturnType<typeof createSupabaseClientForUser>,
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

class ProductService {
  async create(
    accessToken: string,
    data: CreateProductDTO
  ): Promise<ServiceResult<{ id: string }, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data: row, error } = await supabase
      .from("products")
      .insert({
        jewelry_type: data.jewelry_type,
        customer_id: data.customer_id,
        value: data.value,
        payment_status: data.payment_status ?? false,
      })
      .select("id")
      .single()

    if (error || !row) {
      console.error("[ProductService.create]", error)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_CREATE_FAILED,
          message: "Não foi possível registrar a venda.",
        },
      }
    }

    return {
      status: true,
      data: { id: row.id },
    }
  }

  async list(
    accessToken: string,
    filters: ListProductsQuery
  ): Promise<ServiceResult<ProductListResult, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)
    const page = filters.page ?? 1
    const limit = filters.limit ?? PRODUCTS_PAGE_SIZE
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await buildItemsQuery(supabase, filters).range(
      from,
      to
    )

    if (error) {
      console.error("[ProductService.list]", error)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_FETCH_FAILED,
          message: "Não foi possível listar os registros.",
        },
      }
    }

    const items = (data ?? []).map((row) => mapProductRow(row))
    const total = count ?? 0
    const hasMore = from + items.length < total

    const result: ProductListResult = {
      items,
      page,
      limit,
      total,
      has_more: hasMore,
    }

    if (page !== 1) {
      return {
        status: true,
        data: result,
      }
    }

    const pageOneTasks: [
      Promise<{ summaryTotal: number; hasAny: boolean }>,
      Promise<number[]>,
    ] = [
      (async () => {
        if (total > 0) {
          const summaryTotal = await fetchFilteredSummaryTotal(supabase, filters)
          return { summaryTotal, hasAny: true }
        }

        const { count: totalCount, error: countError } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })

        if (countError) {
          console.error("[ProductService.list.hasAny]", countError)
          return { summaryTotal: 0, hasAny: false }
        }

        return { summaryTotal: 0, hasAny: (totalCount ?? 0) > 0 }
      })(),
      fetchAvailableYears(supabase),
    ]

    const [{ summaryTotal, hasAny }, availableYears] = await Promise.all(pageOneTasks)

    return {
      status: true,
      data: {
        ...result,
        summary: {
          count: total,
          total: summaryTotal,
        },
        has_any: hasAny,
        available_years: availableYears,
      },
    }
  }

  async getById(
    accessToken: string,
    productId: string
  ): Promise<ServiceResult<ProductResponse, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", productId)
      .maybeSingle()

    if (error) {
      console.error("[ProductService.getById]", error)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_FETCH_FAILED,
          message: "Não foi possível buscar o registro.",
        },
      }
    }

    if (!data) {
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_NOT_FOUND,
          message: "Registro não encontrado.",
        },
      }
    }

    return {
      status: true,
      data: mapProductRow(data),
    }
  }

  async update(
    accessToken: string,
    productId: string,
    data: UpdateProductDTO
  ): Promise<ServiceResult<ProductResponse, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data: row, error } = await supabase
      .from("products")
      .update(data)
      .eq("id", productId)
      .select(PRODUCT_SELECT)
      .maybeSingle()

    if (error) {
      console.error("[ProductService.update]", error)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_UPDATE_FAILED,
          message: "Não foi possível atualizar o registro.",
        },
      }
    }

    if (!row) {
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_NOT_FOUND,
          message: "Registro não encontrado.",
        },
      }
    }

    return {
      status: true,
      data: mapProductRow(row),
    }
  }

  async getAnalytics(
    accessToken: string,
    filters: ProductAnalyticsQuery
  ): Promise<ServiceResult<ProductAnalytics, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const selectQuery = filters.customer_name
      ? "value, payment_status, jewelry_type, created_at, customers!inner(name)"
      : "value, payment_status, jewelry_type, created_at, customers(name)"

    let query = supabase.from("products").select(selectQuery)

    if (filters.customer_name) {
      query = query.ilike("customers.name", `%${filters.customer_name}%`)
    }

    query = applyListFilters(query, filters)

    const [{ data, error }, availableYears] = await Promise.all([
      query,
      fetchAvailableYears(supabase),
    ])

    if (error) {
      console.error("[ProductService.getAnalytics]", error)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_FETCH_FAILED,
          message: "Não foi possível carregar a análise.",
        },
      }
    }

    return {
      status: true,
      data: buildProductAnalytics(
        (data ?? []) as AnalyticsSourceRow[],
        filters,
        availableYears
      ),
    }
  }

  async getFilterOptions(
    accessToken: string,
    query: ProductFiltersQuery
  ): Promise<ServiceResult<ProductFilterOptions, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const [availableYears, availableMonths] = await Promise.all([
      fetchAvailableYears(supabase),
      fetchAvailableMonths(supabase, query.year),
    ])

    return {
      status: true,
      data: buildProductFilterOptions(availableYears, availableMonths),
    }
  }

  async delete(
    accessToken: string,
    productId: string
  ): Promise<ServiceResult<void, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("[ProductService.delete]", error)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_DELETE_FAILED,
          message: "Não foi possível excluir o registro.",
        },
      }
    }

    if (!data) {
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_NOT_FOUND,
          message: "Registro não encontrado.",
        },
      }
    }

    return { status: true, data: undefined }
  }
}

export default new ProductService()
