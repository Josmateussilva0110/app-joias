import { Request, Response } from "express"
import { ListCustomersQuery } from "@app/shared"
import CustomerService from "../services/CustomerService"
import { customerErrorHttpStatusMap } from "../errors/customerErrorHttpMapper"
import { getAccessToken } from "../utils/getAccessToken"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class CustomerController {
  async create(request: Request, response: Response): Promise<Response> {
    const result = await CustomerService.create(getAccessToken(request), request.body)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        customerErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(201).json({
      success: true,
      message: "Cliente cadastrado com sucesso.",
      data: result.data,
    })
  }

  async list(request: Request, response: Response): Promise<Response> {
    const result = await CustomerService.list(
      getAccessToken(request),
      request.validatedQuery as ListCustomersQuery
    )

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        customerErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    })
  }

  async getById(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as { id: string }

    const result = await CustomerService.getById(getAccessToken(request), id)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        customerErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    })
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as { id: string }

    const result = await CustomerService.update(
      getAccessToken(request),
      id,
      request.body
    )

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        customerErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Cliente atualizado com sucesso.",
      data: result.data,
    })
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as { id: string }

    const result = await CustomerService.delete(getAccessToken(request), id)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        customerErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Cliente excluído com sucesso.",
    })
  }
}

export default new CustomerController()
