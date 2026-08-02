import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import {
  isBirthdayNotificationsSupported,
  resyncBirthdayNotificationsIfEnabled,
} from "@/services/birthday-notifications.service";

export function BirthdayNotificationsSync() {
  const { signed, loading } = useAuth();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isBirthdayNotificationsSupported() || loading || !signed) {
      return;
    }

    const sync = async () => {
      if (isSyncingRef.current) {
        return;
      }

      isSyncingRef.current = true;

      try {
        await resyncBirthdayNotificationsIfEnabled();
      } catch (error) {
        console.warn("[BirthdayNotificationsSync]", error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    void sync();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void sync();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [loading, signed]);

  return null;
}
