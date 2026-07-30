import { useCallback, useEffect, useRef } from "react";

import { clampEarningsPercent } from "@/features/analytics/utils/calculate-earnings";
import {
  useProfile,
  useUpdateEarningsPercent,
} from "@/hooks/use-profile";
import {
  clearAnalyticsEarningsPercent,
  getAnalyticsEarningsPercent,
} from "@/storage/analytics-earnings.storage";

export function useAnalyticsEarningsPercent() {
  const { data: profile, isLoading, isSuccess } = useProfile();
  const updateEarningsPercent = useUpdateEarningsPercent();
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!isSuccess || !profile || migratedRef.current) {
      return;
    }

    migratedRef.current = true;

    void (async () => {
      const localPercent = await getAnalyticsEarningsPercent();

      if (
        localPercent !== profile.earnings_percent &&
        profile.earnings_percent === 100
      ) {
        try {
          await updateEarningsPercent.mutateAsync({
            earnings_percent: localPercent,
          });
        } catch {
          // Mantém o valor local até a próxima tentativa de sync.
        }
      }

      await clearAnalyticsEarningsPercent();
    })();
  }, [isSuccess, profile, updateEarningsPercent]);

  const setPercent = useCallback(
    (value: number) => {
      const clamped = clampEarningsPercent(value);
      void updateEarningsPercent.mutate({ earnings_percent: clamped });
    },
    [updateEarningsPercent]
  );

  return {
    percent: profile?.earnings_percent ?? 100,
    setPercent,
    isLoaded: isSuccess,
    isSaving: updateEarningsPercent.isPending,
    isLoading,
  };
}
