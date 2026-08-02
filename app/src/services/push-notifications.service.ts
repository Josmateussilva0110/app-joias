import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getNotificationSettings,
  registerPushToken,
  removePushToken,
  updateNotificationSettings,
} from "@/services/notification.service";
import {
  BIRTHDAY_NOTIFICATION_CHANNEL_ID,
  BIRTHDAY_NOTIFICATION_DEFAULT_HOUR,
  BIRTHDAY_NOTIFICATION_DEFAULT_MINUTE,
} from "@/features/notifications/constants/birthday-notifications.constants";
import type { BirthdayNotificationTime } from "@/features/notifications/utils/birthday-notification-time";

const PUSH_TOKEN_STORAGE_KEY = "@app:expo_push_token";
const EXPO_PROJECT_ID = "bf241346-b604-4df1-972f-8c8fae3c9628";

export type BirthdayNotificationSettings = BirthdayNotificationTime & {
  enabled: boolean;
  timezone: string;
};

export type PushNotificationPermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
  message?: string;
};

export type PushServiceResult = {
  success: boolean;
  message: string;
  requiresSettings?: boolean;
  token?: string;
};

type ObtainPushTokenResult = {
  token: string | null;
  error?: string;
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

function isPhysicalDevice() {
  if (Platform.OS === "web") {
    return false;
  }

  return Constants.isDevice !== false;
}

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    EXPO_PROJECT_ID
  );
}

function hasGoogleServicesConfigured() {
  return Constants.expoConfig?.extra?.hasGoogleServices === true;
}

function formatPushTokenError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Erro desconhecido ao obter token push.";
  }

  const message = error.message.trim();

  if (/firebase|fcm|google/i.test(message)) {
    return "Firebase/FCM não está configurado neste build Android.";
  }

  return message || "Erro desconhecido ao obter token push.";
}

export function isBirthdayNotificationsSupported() {
  return Platform.OS === "android" || Platform.OS === "ios";
}

export async function openAppNotificationSettings() {
  await Linking.openSettings();
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

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(BIRTHDAY_NOTIFICATION_CHANNEL_ID, {
    name: "Aniversários de clientes",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#B8954A",
  });
}

function isPermissionGranted(status: Notifications.NotificationPermissionsStatus) {
  return status.granted || status.status === "granted";
}

export async function requestPushNotificationPermissions(): Promise<PushNotificationPermissionResult> {
  if (!isBirthdayNotificationsSupported()) {
    return {
      granted: false,
      canAskAgain: false,
      message: "Notificações não são suportadas nesta plataforma.",
    };
  }

  if (!isPhysicalDevice()) {
    return {
      granted: false,
      canAskAgain: false,
      message: "Push notifications exigem um celular físico (não funciona no emulador).",
    };
  }

  await ensureAndroidNotificationChannel();

  const current = await Notifications.getPermissionsAsync();

  if (isPermissionGranted(current)) {
    return { granted: true, canAskAgain: true };
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  if (isPermissionGranted(requested)) {
    return { granted: true, canAskAgain: true };
  }

  const canAskAgain = requested.canAskAgain !== false;

  return {
    granted: false,
    canAskAgain,
    message: canAskAgain
      ? "Permita notificações para receber lembretes de aniversário."
      : "Notificações bloqueadas. Ative nas configurações do app.",
  };
}

export async function obtainExpoPushToken(): Promise<ObtainPushTokenResult> {
  if (!isPhysicalDevice()) {
    return {
      token: null,
      error: "Push notifications exigem um celular físico.",
    };
  }

  const projectId = getExpoProjectId();

  if (!projectId) {
    return {
      token: null,
      error: "Project ID do Expo ausente no app.",
    };
  }

  if (Platform.OS === "android" && !hasGoogleServicesConfigured()) {
    return {
      token: null,
      error:
        "Firebase não configurado neste APK. Adicione app/google-services.json e gere um novo build.",
    };
  }

  try {
    await ensureAndroidNotificationChannel();
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: token.data };
  } catch (error) {
    console.warn("[PushNotifications] getExpoPushTokenAsync failed:", error);
    return {
      token: null,
      error: formatPushTokenError(error),
    };
  }
}

export async function syncPushTokenWithBackend(): Promise<PushServiceResult> {
  if (!isBirthdayNotificationsSupported()) {
    return { success: false, message: "Push não suportado nesta plataforma." };
  }

  const permissions = await requestPushNotificationPermissions();

  if (!permissions.granted) {
    return {
      success: false,
      message:
        permissions.message ??
        "Permita notificações para receber lembretes de aniversário.",
      requiresSettings: permissions.canAskAgain === false,
    };
  }

  const tokenResult = await obtainExpoPushToken();

  if (!tokenResult.token) {
    return {
      success: false,
      message:
        tokenResult.error ??
        "Não foi possível obter o token push deste dispositivo.",
    };
  }

  const result = await registerPushToken(tokenResult.token);

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Não foi possível registrar o token push.",
    };
  }

  await setStoredPushToken(tokenResult.token);

  return {
    success: true,
    message: "Token push registrado.",
    token: tokenResult.token,
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

export async function enableBirthdayNotifications(): Promise<PushServiceResult> {
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

export async function disableBirthdayNotifications(): Promise<PushServiceResult> {
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

export async function updateBirthdayNotificationTime(
  hour: number,
  minute: number
): Promise<PushServiceResult> {
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
