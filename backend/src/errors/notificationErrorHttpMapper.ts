import { NotificationErrorCode } from "../types/code/notificationCode"

export const notificationErrorHttpStatusMap: Record<NotificationErrorCode, number> = {
  [NotificationErrorCode.PUSH_TOKEN_REGISTER_FAILED]: 500,
  [NotificationErrorCode.PUSH_TOKEN_REMOVE_FAILED]: 500,
  [NotificationErrorCode.SETTINGS_FETCH_FAILED]: 500,
  [NotificationErrorCode.SETTINGS_UPDATE_FAILED]: 500,
  [NotificationErrorCode.INVALID_PUSH_TOKEN]: 400,
}
