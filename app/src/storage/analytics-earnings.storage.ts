import AsyncStorage from "@react-native-async-storage/async-storage";

const ANALYTICS_EARNINGS_PERCENT_KEY = "@app:analytics_earnings_percent";
export const DEFAULT_ANALYTICS_EARNINGS_PERCENT = 100;

export async function getAnalyticsEarningsPercent() {
  const value = await AsyncStorage.getItem(ANALYTICS_EARNINGS_PERCENT_KEY);

  if (value === null) {
    return DEFAULT_ANALYTICS_EARNINGS_PERCENT;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_ANALYTICS_EARNINGS_PERCENT;
  }

  return Math.min(100, Math.max(0, parsed));
}

export async function saveAnalyticsEarningsPercent(percent: number) {
  const clamped = Math.min(100, Math.max(0, percent));
  await AsyncStorage.setItem(ANALYTICS_EARNINGS_PERCENT_KEY, String(clamped));
}

export async function clearAnalyticsEarningsPercent() {
  await AsyncStorage.removeItem(ANALYTICS_EARNINGS_PERCENT_KEY);
}
