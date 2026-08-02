import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BIRTHDAY_NOTIFICATION_DEFAULT_HOUR,
  BIRTHDAY_NOTIFICATION_DEFAULT_MINUTE,
} from "@/features/notifications/constants/birthday-notifications.constants";

const BIRTHDAY_NOTIFICATIONS_ENABLED_KEY = "@app:birthday_notifications_enabled";
const BIRTHDAY_NOTIFICATION_TIME_KEY = "@app:birthday_notifications_time";

export type BirthdayNotificationTime = {
  hour: number;
  minute: number;
};

export async function isBirthdayNotificationsEnabled() {
  const value = await AsyncStorage.getItem(BIRTHDAY_NOTIFICATIONS_ENABLED_KEY);
  return value === "true";
}

export async function setBirthdayNotificationsEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    BIRTHDAY_NOTIFICATIONS_ENABLED_KEY,
    enabled ? "true" : "false"
  );
}

export async function getBirthdayNotificationTime(): Promise<BirthdayNotificationTime> {
  const value = await AsyncStorage.getItem(BIRTHDAY_NOTIFICATION_TIME_KEY);

  if (!value) {
    return {
      hour: BIRTHDAY_NOTIFICATION_DEFAULT_HOUR,
      minute: BIRTHDAY_NOTIFICATION_DEFAULT_MINUTE,
    };
  }

  try {
    const parsed = JSON.parse(value) as Partial<BirthdayNotificationTime>;

    if (
      typeof parsed.hour === "number" &&
      typeof parsed.minute === "number" &&
      parsed.hour >= 0 &&
      parsed.hour <= 23 &&
      parsed.minute >= 0 &&
      parsed.minute <= 59
    ) {
      return {
        hour: parsed.hour,
        minute: parsed.minute,
      };
    }
  } catch {
    // Valor inválido — usa padrão.
  }

  return {
    hour: BIRTHDAY_NOTIFICATION_DEFAULT_HOUR,
    minute: BIRTHDAY_NOTIFICATION_DEFAULT_MINUTE,
  };
}

export async function setBirthdayNotificationTime(time: BirthdayNotificationTime) {
  await AsyncStorage.setItem(BIRTHDAY_NOTIFICATION_TIME_KEY, JSON.stringify(time));
}
