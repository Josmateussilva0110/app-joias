import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  isBirthdayNotificationsSupported,
  syncPushTokenWithBackend,
} from "@/services/push-notifications.service";

export function PushTokenRegistration() {
  const { signed, loading } = useAuth();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isBirthdayNotificationsSupported() || loading || !signed) {
      hasSyncedRef.current = false;
      return;
    }

    if (hasSyncedRef.current) {
      return;
    }

    hasSyncedRef.current = true;

    void syncPushTokenWithBackend().catch((error) => {
      console.warn("[PushTokenRegistration]", error);
      hasSyncedRef.current = false;
    });
  }, [loading, signed]);

  return null;
}
