import {
  CreateCustomerDTO,
  CustomerResponse,
  UpdateCustomerDTO,
  mapCustomerRow,
} from "@app/shared"
import { createSupabaseClientForUser } from "../database/supabase/supabase"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { CustomerErrorCode } from "../types/code/customerCode"

const CUSTOMER_SELECT =
  "id, created_by, name, phone, birth_date, created_at, updated_at"

type SupabaseError = {
  code?: string
  message?: string
}

function isUniqueViolation(error: SupabaseError | null) {
  return error?.code === "23505"
}

class CustomerService {
  private async hasPhoneInUse(
    accessToken: string,
    phone: string,
    excludeCustomerId?: string
  ): Promise<ServiceResult<boolean, CustomerErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    let query = supabase.from("customers").select("id").eq("phone", phone)

    if (excludeCustomerId) {
      query = query.neq("id", excludeCustomerId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error("[CustomerService.hasPhoneInUse]", error)
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_FETCH_FAILED,
          message: "Não foi possível validar o telefone.",
        },
      }
    }

    return {
      status: true,
      data: Boolean(data),
    }
  }

  private async hasLinkedSales(
    accessToken: string,
    customerId: string
  ): Promise<ServiceResult<boolean, CustomerErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId)

    if (error) {
      console.error("[CustomerService.hasLinkedSales]", error)
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_FETCH_FAILED,
          message: "Não foi possível verificar vendas vinculadas.",
        },
      }
    }

    return {
      status: true,
      data: (count ?? 0) > 0,
    }
  }

  async create(
    accessToken: string,
    data: CreateCustomerDTO
  ): Promise<ServiceResult<{ id: string }, CustomerErrorCode>> {
    const phoneCheck = await this.hasPhoneInUse(accessToken, data.phone)

    if (!phoneCheck.status) {
      return phoneCheck
    }

    if (phoneCheck.data) {
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_PHONE_ALREADY_EXISTS,
          message: "Este telefone já está cadastrado para outro cliente.",
        },
      }
    }

    const supabase = createSupabaseClientForUser(accessToken)

    const { data: row, error } = await supabase
      .from("customers")
      .insert({
        name: data.name,
        phone: data.phone,
        birth_date: data.birth_date,
      })
      .select("id")
      .single()

    if (error || !row) {
      console.error("[CustomerService.create]", error)

      if (isUniqueViolation(error)) {
        return {
          status: false,
          error: {
            code: CustomerErrorCode.CUSTOMER_PHONE_ALREADY_EXISTS,
            message: "Este telefone já está cadastrado para outro cliente.",
          },
        }
      }

      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_CREATE_FAILED,
          message: "Não foi possível cadastrar o cliente.",
        },
      }
    }

    return {
      status: true,
      data: { id: row.id },
    }
  }

  async list(
    accessToken: string
  ): Promise<ServiceResult<CustomerResponse[], CustomerErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("customers")
      .select(CUSTOMER_SELECT)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[CustomerService.list]", error)
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_FETCH_FAILED,
          message: "Não foi possível listar os clientes.",
        },
      }
    }

    return {
      status: true,
      data: (data ?? []).map(mapCustomerRow),
    }
  }

  async getById(
    accessToken: string,
    customerId: string
  ): Promise<ServiceResult<CustomerResponse, CustomerErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("customers")
      .select(CUSTOMER_SELECT)
      .eq("id", customerId)
      .maybeSingle()

    if (error) {
      console.error("[CustomerService.getById]", error)
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_FETCH_FAILED,
          message: "Não foi possível buscar o cliente.",
        },
      }
    }

    if (!data) {
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_NOT_FOUND,
          message: "Cliente não encontrado.",
        },
      }
    }

    return {
      status: true,
      data: mapCustomerRow(data),
    }
  }

  async update(
    accessToken: string,
    customerId: string,
    data: UpdateCustomerDTO
  ): Promise<ServiceResult<CustomerResponse, CustomerErrorCode>> {
    if (data.phone !== undefined) {
      const phoneCheck = await this.hasPhoneInUse(
        accessToken,
        data.phone,
        customerId
      )

      if (!phoneCheck.status) {
        return phoneCheck
      }

      if (phoneCheck.data) {
        return {
          status: false,
          error: {
            code: CustomerErrorCode.CUSTOMER_PHONE_ALREADY_EXISTS,
            message: "Este telefone já está cadastrado para outro cliente.",
          },
        }
      }
    }

    const supabase = createSupabaseClientForUser(accessToken)

    const { data: row, error } = await supabase
      .from("customers")
      .update(data)
      .eq("id", customerId)
      .select(CUSTOMER_SELECT)
      .maybeSingle()

    if (error) {
      console.error("[CustomerService.update]", error)

      if (isUniqueViolation(error)) {
        return {
          status: false,
          error: {
            code: CustomerErrorCode.CUSTOMER_PHONE_ALREADY_EXISTS,
            message: "Este telefone já está cadastrado para outro cliente.",
          },
        }
      }

      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_UPDATE_FAILED,
          message: "Não foi possível atualizar o cliente.",
        },
      }
    }

    if (!row) {
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_NOT_FOUND,
          message: "Cliente não encontrado.",
        },
      }
    }

    return {
      status: true,
      data: mapCustomerRow(row),
    }
  }

  async delete(
    accessToken: string,
    customerId: string
  ): Promise<ServiceResult<void, CustomerErrorCode>> {
    const salesCheck = await this.hasLinkedSales(accessToken, customerId)

    if (!salesCheck.status) {
      return salesCheck
    }

    if (salesCheck.data) {
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_HAS_SALES,
          message: "Não é possível excluir um cliente com vendas vinculadas.",
        },
      }
    }

    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("[CustomerService.delete]", error)

      if (error.code === "23503") {
        return {
          status: false,
          error: {
            code: CustomerErrorCode.CUSTOMER_HAS_SALES,
            message: "Não é possível excluir um cliente com vendas vinculadas.",
          },
        }
      }

      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_DELETE_FAILED,
          message: "Não foi possível excluir o cliente.",
        },
      }
    }

    if (!data) {
      return {
        status: false,
        error: {
          code: CustomerErrorCode.CUSTOMER_NOT_FOUND,
          message: "Cliente não encontrado.",
        },
      }
    }

    return { status: true, data: undefined }
  }
}

export default new CustomerService()
