import { Request, Response } from "express"
import NotificationService from "../services/NotificationService"
import { notificationErrorHttpStatusMap } from "../errors/notificationErrorHttpMapper"
import { getAccessToken } from "../utils/getAccessToken"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class NotificationController {
  async registerToken(request: Request, response: Response): Promise<Response> {
    const result = await NotificationService.registerPushToken(
      getAccessToken(request),
      request.user!.id,
      request.body
    )

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        notificationErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Token push registrado com sucesso.",
      data: result.data,
    })
  }

  async removeToken(request: Request, response: Response): Promise<Response> {
    const { expo_push_token } = request.body as { expo_push_token?: string }

    if (!expo_push_token) {
      return response.status(400).json({
        success: false,
        message: "Token push é obrigatório.",
      })
    }

    const result = await NotificationService.removePushToken(
      getAccessToken(request),
      expo_push_token
    )

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        notificationErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Token push removido com sucesso.",
    })
  }

  async getSettings(request: Request, response: Response): Promise<Response> {
    const result = await NotificationService.getSettings(
      getAccessToken(request),
      request.user!.id
    )

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        notificationErrorHttpStatusMap
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

  async updateSettings(request: Request, response: Response): Promise<Response> {
    const result = await NotificationService.updateSettings(
      getAccessToken(request),
      request.user!.id,
      request.body
    )

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        notificationErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Configurações de notificação salvas com sucesso.",
      data: result.data,
    })
  }
}

export default new NotificationController()
