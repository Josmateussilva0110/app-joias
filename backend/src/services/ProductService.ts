import {
  CreateProductDTO,
  ListProductsQuery,
  ProductListResult,
  ProductResponse,
  UpdateProductDTO,
  mapProductRow,
} from "@app/shared"
import { createSupabaseClientForUser } from "../database/supabase/supabase"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { ProductErrorCode } from "../types/code/productCode"

const PRODUCT_SELECT =
  "id, created_by, jewelry_type, customer_name, value, payment_status, created_at, updated_at"

const MIN_FILTER_YEAR = 2026

function getAvailableYears(createdAtValues: Array<{ created_at: string }>) {
  const years = new Set<number>()
  const currentYear = new Date().getFullYear()

  for (const row of createdAtValues) {
    const year = new Date(row.created_at).getFullYear()
    if (year >= MIN_FILTER_YEAR) {
      years.add(year)
    }
  }

  if (currentYear >= MIN_FILTER_YEAR) {
    years.add(currentYear)
  }

  const sortedYears = Array.from(years).sort((a, b) => b - a)

  if (sortedYears.length === 0 && currentYear >= MIN_FILTER_YEAR) {
    return [currentYear]
  }

  return sortedYears
}

function getDateRange(filters: ListProductsQuery) {
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

function summarizeProducts(products: ProductResponse[]) {
  return {
    count: products.length,
    total: products.reduce((sum, product) => sum + product.value, 0),
  }
}

function applyMonthOnlyFilter(
  products: ProductResponse[],
  month: number
): ProductResponse[] {
  return products.filter(
    (product) => new Date(product.created_at).getMonth() + 1 === month
  )
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
        customer_name: data.customer_name,
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

    const { count: totalCount, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })

    if (countError) {
      console.error("[ProductService.list.count]", countError)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_FETCH_FAILED,
          message: "Não foi possível listar os registros.",
        },
      }
    }

    const { data: yearRows, error: yearsError } = await supabase
      .from("products")
      .select("created_at")

    if (yearsError) {
      console.error("[ProductService.list.years]", yearsError)
      return {
        status: false,
        error: {
          code: ProductErrorCode.PRODUCT_FETCH_FAILED,
          message: "Não foi possível listar os registros.",
        },
      }
    }

    const availableYears = getAvailableYears(yearRows ?? [])

    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false })

    if (filters.customer_name) {
      query = query.ilike("customer_name", `%${filters.customer_name}%`)
    }

    if (filters.jewelry_type) {
      query = query.eq("jewelry_type", filters.jewelry_type)
    }

    if (filters.payment === "paid") {
      query = query.eq("payment_status", true)
    } else if (filters.payment === "unpaid") {
      query = query.eq("payment_status", false)
    }

    const dateRange = getDateRange(filters)
    if (dateRange) {
      query = query
        .gte("created_at", dateRange.start)
        .lt("created_at", dateRange.end)
    }

    const { data, error } = await query

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

    let items = (data ?? []).map(mapProductRow)

    if (filters.month && !filters.year) {
      items = applyMonthOnlyFilter(items, filters.month)
    }

    return {
      status: true,
      data: {
        items,
        summary: summarizeProducts(items),
        has_any: (totalCount ?? 0) > 0,
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
