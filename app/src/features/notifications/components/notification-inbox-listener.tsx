import { useEffect } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { RECENT_NOTIFICATIONS_KEY } from "@/hooks/use-recent-notifications";
import {
  captureRecentNotification,
  syncRecentNotificationsFromTray,
} from "@/services/recent-notifications.service";

export function NotificationInboxListener() {
  const { signed, loading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (Platform.OS === "web" || loading || !signed) {
      return;
    }

    const syncTray = () => {
      void syncRecentNotificationsFromTray().then((items) => {
        queryClient.setQueryData([RECENT_NOTIFICATIONS_KEY], items);
      });
    };

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        void captureRecentNotification(notification).then((items) => {
          queryClient.setQueryData([RECENT_NOTIFICATIONS_KEY], items);
        });
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        void captureRecentNotification(response.notification).then((items) => {
          queryClient.setQueryData([RECENT_NOTIFICATIONS_KEY], items);
        });
      });

    syncTray();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        syncTray();
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, [loading, queryClient, signed]);

  return null;
}
