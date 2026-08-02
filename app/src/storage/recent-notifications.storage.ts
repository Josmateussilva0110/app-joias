import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_NOTIFICATIONS_KEY = "@app:recent_notifications";
const MAX_RECENT_NOTIFICATIONS = 50;

export type RecentNotification = {
  id: string;
  nativeIdentifier?: string;
  title: string;
  body: string;
  receivedAt: string;
  customerId?: string;
  type?: string;
};

export async function getRecentNotifications() {
  const value = await AsyncStorage.getItem(RECENT_NOTIFICATIONS_KEY);

  if (!value) {
    return [] as RecentNotification[];
  }

  try {
    const parsed = JSON.parse(value) as RecentNotification[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.body === "string" &&
        typeof item.receivedAt === "string"
    );
  } catch {
    return [];
  }
}

async function saveRecentNotifications(items: RecentNotification[]) {
  await AsyncStorage.setItem(
    RECENT_NOTIFICATIONS_KEY,
    JSON.stringify(items.slice(0, MAX_RECENT_NOTIFICATIONS))
  );
}

export async function addRecentNotification(notification: RecentNotification) {
  const current = await getRecentNotifications();
  const withoutDuplicate = current.filter((item) => item.id !== notification.id);
  const next = [notification, ...withoutDuplicate].slice(0, MAX_RECENT_NOTIFICATIONS);
  await saveRecentNotifications(next);
  return next;
}

export async function mergeRecentNotifications(notifications: RecentNotification[]) {
  if (notifications.length === 0) {
    return getRecentNotifications();
  }

  const current = await getRecentNotifications();
  const byId = new Map<string, RecentNotification>();

  for (const item of current) {
    byId.set(item.id, item);
  }

  for (const item of notifications) {
    byId.set(item.id, item);
  }

  const next = [...byId.values()]
    .sort(
      (left, right) =>
        new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime()
    )
    .slice(0, MAX_RECENT_NOTIFICATIONS);

  await saveRecentNotifications(next);
  return next;
}

export async function removeRecentNotification(notificationId: string) {
  const current = await getRecentNotifications();
  const next = current.filter((item) => item.id !== notificationId);
  await saveRecentNotifications(next);
  return next;
}

export async function clearRecentNotifications() {
  await AsyncStorage.removeItem(RECENT_NOTIFICATIONS_KEY);
}
