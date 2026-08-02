import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getNotificationSettings,
  registerPushToken,
  removePushToken,
  updateNotificationSettings,
} from "@/services/notification.service";
import {
  BIRTHDAY_NOTIFICATION_DEFAULT_HOUR,
  BIRTHDAY_NOTIFICATION_DEFAULT_MINUTE,
} from "@/features/notifications/constants/birthday-notifications.constants";
import type { BirthdayNotificationTime } from "@/features/notifications/utils/birthday-notification-time";

const PUSH_TOKEN_STORAGE_KEY = "@app:expo_push_token";

export type BirthdayNotificationSettings = BirthdayNotificationTime & {
  enabled: boolean;
  timezone: string;
};

function getDeviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  } catch {
    return "America/Sao_Paulo";
  }
}

function getDefaultSettings(): BirthdayNotificationSettings {
  return {
    enabled: false,
    hour: BIRTHDAY_NOTIFICATION_DEFAULT_HOUR,
    minute: BIRTHDAY_NOTIFICATION_DEFAULT_MINUTE,
    timezone: getDeviceTimezone(),
  };
}

export function isBirthdayNotificationsSupported() {
  return Platform.OS === "android" || Platform.OS === "ios";
}

async function getStoredPushToken() {
  return AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}

async function setStoredPushToken(token: string | null) {
  if (!token) {
    await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
}

export async function requestPushNotificationPermissions() {
  if (!isBirthdayNotificationsSupported()) {
    return { granted: false };
  }

  if (!Device.isDevice) {
    return { granted: false };
  }

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return { granted: true };
  }

  const requested = await Notifications.requestPermissionsAsync();
  return { granted: requested.granted };
}

export async function obtainExpoPushToken() {
  if (!Device.isDevice) {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn("[PushNotifications] projectId ausente no app config.");
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.warn("[PushNotifications] getExpoPushTokenAsync failed:", error);
    return null;
  }
}

export async function syncPushTokenWithBackend() {
  if (!isBirthdayNotificationsSupported()) {
    return { success: false, message: "Push não suportado nesta plataforma." };
  }

  const permissions = await requestPushNotificationPermissions();

  if (!permissions.granted) {
    return {
      success: false,
      message: "Permita notificações para receber lembretes de aniversário.",
    };
  }

  const token = await obtainExpoPushToken();

  if (!token) {
    return {
      success: false,
      message: "Não foi possível obter o token push deste dispositivo.",
    };
  }

  const result = await registerPushToken(token);

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Não foi possível registrar o token push.",
    };
  }

  await setStoredPushToken(token);

  return {
    success: true,
    message: "Token push registrado.",
    token,
  };
}

export async function unregisterPushTokenFromBackend() {
  const token = await getStoredPushToken();

  if (!token) {
    return;
  }

  try {
    await removePushToken(token);
  } catch (error) {
    console.warn("[PushNotifications] remove token failed:", error);
  } finally {
    await setStoredPushToken(null);
  }
}

export async function getBirthdayNotificationSettings(): Promise<BirthdayNotificationSettings> {
  const result = await getNotificationSettings();

  if (!result.success || !result.data) {
    return getDefaultSettings();
  }

  return {
    enabled: result.data.enabled,
    hour: result.data.notify_hour,
    minute: result.data.notify_minute,
    timezone: result.data.timezone,
  };
}

export async function enableBirthdayNotifications() {
  if (!isBirthdayNotificationsSupported()) {
    return {
      success: false,
      message: "Lembretes de aniversário disponíveis apenas no celular.",
    };
  }

  const tokenResult = await syncPushTokenWithBackend();

  if (!tokenResult.success) {
    return tokenResult;
  }

  const current = await getBirthdayNotificationSettings();

  const result = await updateNotificationSettings({
    enabled: true,
    notify_hour: current.hour,
    notify_minute: current.minute,
    timezone: getDeviceTimezone(),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Não foi possível ativar os lembretes.",
    };
  }

  return {
    success: true,
    message: "Lembretes de aniversário ativados.",
  };
}

export async function disableBirthdayNotifications() {
  const current = await getBirthdayNotificationSettings();

  const result = await updateNotificationSettings({
    enabled: false,
    notify_hour: current.hour,
    notify_minute: current.minute,
    timezone: current.timezone || getDeviceTimezone(),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Não foi possível desativar os lembretes.",
    };
  }

  return {
    success: true,
    message: "Lembretes de aniversário desativados.",
  };
}

export async function updateBirthdayNotificationTime(hour: number, minute: number) {
  const current = await getBirthdayNotificationSettings();

  const result = await updateNotificationSettings({
    enabled: current.enabled,
    notify_hour: hour,
    notify_minute: minute,
    timezone: getDeviceTimezone(),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Não foi possível atualizar o horário dos lembretes.",
    };
  }

  return {
    success: true,
    message: "Horário dos lembretes atualizado.",
  };
}

export async function clearBirthdayNotificationsOnLogout() {
  await unregisterPushTokenFromBackend();
}
