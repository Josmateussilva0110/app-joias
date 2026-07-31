import { Platform, type ViewStyle } from "react-native";

export function premiumCardShadow(
  accentColor: string,
  isDark: boolean
): ViewStyle {
  return (
    Platform.select({
      ios: {
        shadowColor: isDark ? "#000000" : accentColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.26 : 0.1,
        shadowRadius: 18,
      },
      android: {
        elevation: isDark ? 4 : 2,
      },
      default: {},
    }) ?? {}
  );
}

export function premiumFabShadow(isDark: boolean): ViewStyle {
  return (
    Platform.select({
      ios: {
        shadowColor: isDark ? "#D4B978" : "#8A6D2F",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.45 : 0.28,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }) ?? {}
  );
}
