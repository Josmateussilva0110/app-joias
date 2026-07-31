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
import { PRODUCT_SELECT } from "../constants/product.constants"
import { createSupabaseClientForUser } from "../database/supabase/supabase"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { ProductErrorCode } from "../types/code/productCode"
import {
  AnalyticsSourceRow,
  buildProductAnalytics,
} from "../utils/productAnalytics"
import { buildProductFilterOptions } from "../utils/productFilterOptions"
import { applyListFilters } from "../utils/productQueryFilters"
import {
  buildItemsQuery,
  fetchAvailableMonths,
  fetchAvailableYears,
  fetchFilteredSummaryTotal,
} from "../utils/productQueries"

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
  ): Promise<ServiceResult<{ id: string }, ProductErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data: row, error } = await supabase
      .from("products")
      .update(data)
      .eq("id", productId)
      .select("id")
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
      data: { id: row.id },
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
