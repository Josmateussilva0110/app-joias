import {
  NotificationSettingsResponse,
  UpdateNotificationSettingsDTO,
} from "@app/shared";
import { NOTIFICATION_ROUTES } from "@/config/api-routes";
import { requestData } from "./request";

export function registerPushToken(expoPushToken: string) {
  return requestData<{ id: string }>({
    endpoint: NOTIFICATION_ROUTES.registerToken,
    method: "POST",
    data: { expo_push_token: expoPushToken },
  });
}

export function removePushToken(expoPushToken: string) {
  return requestData({
    endpoint: NOTIFICATION_ROUTES.registerToken,
    method: "DELETE",
    data: { expo_push_token: expoPushToken },
  });
}

export function getNotificationSettings() {
  return requestData<NotificationSettingsResponse>({
    endpoint: NOTIFICATION_ROUTES.settings,
    method: "GET",
  });
}

export function updateNotificationSettings(data: UpdateNotificationSettingsDTO) {
  return requestData<NotificationSettingsResponse>({
    endpoint: NOTIFICATION_ROUTES.settings,
    method: "PUT",
    data,
  });
}
