import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useAnalyticsLayout } from "../utils/use-analytics-layout";

type AnalyticsChartCardProps = {
  title: string;
  children: ReactNode;
};

export function AnalyticsChartCard({ title, children }: AnalyticsChartCardProps) {
  const { colors } = useTheme();
  const { isCompact } = useAnalyticsLayout();
  const styles = createStyles(colors, isCompact);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 16,
      padding: isCompact ? 12 : 16,
      gap: isCompact ? 10 : 12,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    title: {
      fontSize: isCompact ? 13 : 14,
      fontWeight: "700",
      color: colors.text,
    },
  });
