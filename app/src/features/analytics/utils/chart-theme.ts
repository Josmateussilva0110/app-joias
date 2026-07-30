import type { TextStyle } from "react-native";

import type { ThemeColors } from "@/context/theme.context";

export function getAnalyticsChartColors(colors: ThemeColors) {
  return {
    primary: colors.primary,
    accent: colors.accent,
    success: colors.success,
    danger: colors.danger,
    text: colors.text,
    textSecondary: colors.textSecondary,
    grid: colors.backgroundSelected,
    card: colors.backgroundElement,
  };
}

export function getAnalyticsAxisLabelStyle(
  colors: ThemeColors,
  isCompact: boolean
): TextStyle {
  return {
    color: colors.textSecondary,
    fontSize: isCompact ? 9 : 10,
  };
}
