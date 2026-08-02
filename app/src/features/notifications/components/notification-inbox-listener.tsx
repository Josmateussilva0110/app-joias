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
import { resyncBirthdayNotificationsIfEnabled } from "@/services/birthday-notifications.service";

export function NotificationInboxListener() {
  const { signed, loading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (Platform.OS !== "android" || loading || !signed) {
      return;
    }

    const invalidate = () => {
      void syncRecentNotificationsFromTray().then((items) => {
        queryClient.setQueryData([RECENT_NOTIFICATIONS_KEY], items);
      });
    };

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        void captureRecentNotification(notification).then(() => {
          invalidate();

          const data = notification.request.content.data as Record<string, unknown>;
          if (data?.type === "customer-birthday") {
            void resyncBirthdayNotificationsIfEnabled();
          }
        });
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        void captureRecentNotification(response.notification).then(() => {
          invalidate();

          const data = response.notification.request.content.data as Record<string, unknown>;
          if (data?.type === "customer-birthday") {
            void resyncBirthdayNotificationsIfEnabled();
          }
        });
      });

    invalidate();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        invalidate();
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
