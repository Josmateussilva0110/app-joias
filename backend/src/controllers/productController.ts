import { Request, Response } from "express"
import { ListProductsQuery, ProductAnalyticsQuery, ProductFiltersQuery } from "@app/shared"
import ProductService from "../services/ProductService"
import { productErrorHttpStatusMap } from "../errors/productErrorHttpMapper"
import { getAccessToken } from "../utils/getAccessToken"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class ProductController {
  async create(request: Request, response: Response): Promise<Response> {
    const result = await ProductService.create(getAccessToken(request), request.body)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(201).json({
      success: true,
      message: "Venda registrada com sucesso.",
      data: result.data,
    })
  }

  async list(request: Request, response: Response): Promise<Response> {
    const filters = request.validatedQuery as ListProductsQuery
    const result = await ProductService.list(getAccessToken(request), filters)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
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

  async analytics(request: Request, response: Response): Promise<Response> {
    const filters = request.validatedQuery as ProductAnalyticsQuery
    const result = await ProductService.getAnalytics(getAccessToken(request), filters)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
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

  async filters(request: Request, response: Response): Promise<Response> {
    const query = request.validatedQuery as ProductFiltersQuery
    const result = await ProductService.getFilterOptions(getAccessToken(request), query)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
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

    const result = await ProductService.getById(getAccessToken(request), id)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
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

    const result = await ProductService.update(
      getAccessToken(request),
      id,
      request.body
    )

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Registro atualizado com sucesso.",
      data: result.data,
    })
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.validatedParams as { id: string }

    const result = await ProductService.delete(getAccessToken(request), id)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Registro excluído com sucesso.",
    })
  }
}

export default new ProductController()
