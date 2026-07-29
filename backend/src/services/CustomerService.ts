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

class CustomerService {
  async create(
    accessToken: string,
    data: CreateCustomerDTO
  ): Promise<ServiceResult<{ id: string }, CustomerErrorCode>> {
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
    const supabase = createSupabaseClientForUser(accessToken)

    const { data: row, error } = await supabase
      .from("customers")
      .update(data)
      .eq("id", customerId)
      .select(CUSTOMER_SELECT)
      .maybeSingle()

    if (error) {
      console.error("[CustomerService.update]", error)
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
    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("[CustomerService.delete]", error)
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
