import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  addRecentNotification,
  clearRecentNotifications,
  getRecentNotifications,
  mergeRecentNotifications,
  removeRecentNotification,
  type RecentNotification,
} from "@/storage/recent-notifications.storage";

function mapExpoNotification(notification: Notifications.Notification): RecentNotification {
  const content = notification.request.content;
  const data = (content.data ?? {}) as Record<string, unknown>;
  const receivedAt = new Date(notification.date ?? Date.now()).toISOString();

  return {
    id: notification.request.identifier,
    nativeIdentifier: notification.request.identifier,
    title: content.title?.trim() || "Notificação",
    body: content.body?.trim() || "",
    receivedAt,
    customerId: typeof data.customerId === "string" ? data.customerId : undefined,
    type: typeof data.type === "string" ? data.type : undefined,
  };
}

export async function listRecentNotifications() {
  const items = await getRecentNotifications();
  return items.sort(
    (left, right) =>
      new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime()
  );
}

export async function captureRecentNotification(
  notification: Notifications.Notification
) {
  return addRecentNotification(mapExpoNotification(notification));
}

export async function syncRecentNotificationsFromTray() {
  if (Platform.OS === "web") {
    return listRecentNotifications();
  }

  if (typeof Notifications.getPresentedNotificationsAsync !== "function") {
    return listRecentNotifications();
  }

  try {
    const presented = await Notifications.getPresentedNotificationsAsync();

    if (presented.length === 0) {
      return listRecentNotifications();
    }

    return mergeRecentNotifications(presented.map(mapExpoNotification));
  } catch (error) {
    console.warn("[RecentNotifications] sync tray failed:", error);
  }

  return listRecentNotifications();
}

export async function dismissRecentNotification(notificationId: string) {
  const items = await getRecentNotifications();
  const target = items.find((item) => item.id === notificationId);

  if (
    target?.nativeIdentifier &&
    typeof Notifications.dismissNotificationAsync === "function"
  ) {
    try {
      await Notifications.dismissNotificationAsync(target.nativeIdentifier);
    } catch (error) {
      console.warn("[RecentNotifications] dismiss native failed:", error);
    }
  }

  return removeRecentNotification(notificationId);
}

export async function clearAllRecentNotifications() {
  if (
    Platform.OS !== "web" &&
    typeof Notifications.dismissAllNotificationsAsync === "function"
  ) {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.warn("[RecentNotifications] dismiss all failed:", error);
    }
  }

  await clearRecentNotifications();
}

export async function clearRecentNotificationsOnLogout() {
  await clearRecentNotifications();
}

export function formatRecentNotificationTime(receivedAt: string) {
  const receivedDate = new Date(receivedAt);
  const diffMs = Date.now() - receivedDate.getTime();

  if (diffMs < 60_000) {
    return "Agora";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 60) {
    return `Há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Há ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return diffDays === 1 ? "Ontem" : `Há ${diffDays} dias`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(receivedDate);
}
