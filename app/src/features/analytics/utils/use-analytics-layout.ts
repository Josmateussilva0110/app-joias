import { useWindowDimensions } from "react-native";

const COMPACT_BREAKPOINT = 380;

export function useAnalyticsLayout() {
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_BREAKPOINT;
  const screenPadding = isCompact ? 16 : 24;
  const cardPadding = 16;
  const chartWidth = width - screenPadding * 2 - cardPadding * 2;

  return {
    isCompact,
    screenPadding,
    chartWidth: Math.max(chartWidth, 240),
  };
}

export function getActiveMonthlyPoints<T extends { count: number; total: number }>(
  points: T[]
) {
  return points.filter((point) => point.count > 0 || point.total > 0);
}
