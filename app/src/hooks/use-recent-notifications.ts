import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearAllRecentNotifications,
  dismissRecentNotification,
  listRecentNotifications,
  syncRecentNotificationsFromTray,
} from "@/services/recent-notifications.service";
import type { RecentNotification } from "@/storage/recent-notifications.storage";
import { useAuth } from "./useAuth";

export const RECENT_NOTIFICATIONS_KEY = "recent-notifications";

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

export function useRecentNotifications() {
  const { signed, loading } = useAuth();

  return useQuery<RecentNotification[], QueryError>({
    queryKey: [RECENT_NOTIFICATIONS_KEY],
    enabled: signed && !loading,
    queryFn: syncRecentNotificationsFromTray,
    staleTime: 30 * 1000,
  });
}

export function useRecentNotificationsBadgeCount() {
  const query = useRecentNotifications();

  return {
    ...query,
    badgeCount: query.data?.length ?? 0,
  };
}

export function useRecentNotificationsActions() {
  const queryClient = useQueryClient();

  const refresh = async () => {
    const items = await syncRecentNotificationsFromTray();
    queryClient.setQueryData([RECENT_NOTIFICATIONS_KEY], items);
    return items;
  };

  const dismissOne = async (notificationId: string) => {
    const items = await dismissRecentNotification(notificationId);
    queryClient.setQueryData([RECENT_NOTIFICATIONS_KEY], items);
    return items;
  };

  const dismissAll = async () => {
    await clearAllRecentNotifications();
    queryClient.setQueryData([RECENT_NOTIFICATIONS_KEY], []);
  };

  return {
    refresh,
    dismissOne,
    dismissAll,
  };
}
