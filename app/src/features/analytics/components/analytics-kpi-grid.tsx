import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { formatCurrency } from "@/features/products/constants/product-labels";
import type { ProductAnalytics } from "@app/shared";
import { useAnalyticsLayout } from "../utils/use-analytics-layout";

type AnalyticsKpiGridProps = {
  summary: ProductAnalytics["summary"];
};

type KpiItemProps = {
  label: string;
  value: string;
  hint?: string;
  danger?: boolean;
  colors: ThemeColors;
  isCompact: boolean;
};

function KpiItem({ label, value, hint, danger, colors, isCompact }: KpiItemProps) {
  const styles = createItemStyles(colors, isCompact);

  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[styles.value, danger && styles.valueDanger]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function AnalyticsKpiGrid({ summary }: AnalyticsKpiGridProps) {
  const { colors } = useTheme();
  const { isCompact } = useAnalyticsLayout();
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact]
  );

  return (
    <LinearGradient
      colors={[
        colors.summaryGradientStart,
        colors.summaryGradientMid,
        colors.summaryGradientEnd,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.row}>
        <KpiItem
          colors={colors}
          isCompact={isCompact}
          label="Total vendido"
          value={formatCurrency(summary.total)}
        />
        <View style={styles.dividerVertical} />
        <KpiItem
          colors={colors}
          isCompact={isCompact}
          label="Quantidade"
          value={String(summary.count)}
        />
      </View>

      <View style={styles.dividerHorizontal} />

      <View style={styles.row}>
        <KpiItem
          colors={colors}
          isCompact={isCompact}
          label="Ticket médio"
          value={formatCurrency(summary.average_ticket)}
        />
        <View style={styles.dividerVertical} />
        <KpiItem
          colors={colors}
          isCompact={isCompact}
          label="Devendo"
          value={formatCurrency(summary.unpaid_total)}
          hint={`${summary.unpaid_count} vendas`}
          danger
        />
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardBorderDefault,
      paddingVertical: isCompact ? 12 : 14,
      paddingHorizontal: isCompact ? 10 : 12,
      gap: isCompact ? 10 : 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    dividerVertical: {
      width: 1,
      backgroundColor: colors.cardBorderDefault,
      marginHorizontal: isCompact ? 6 : 8,
    },
    dividerHorizontal: {
      height: 1,
      backgroundColor: colors.cardBorderDefault,
    },
  });

const createItemStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    item: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    label: {
      fontSize: isCompact ? 9 : 10,
      fontWeight: "700",
      color: colors.summaryLabel,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    value: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "800",
      color: colors.summaryValue,
    },
    valueDanger: {
      color: colors.danger,
    },
    hint: {
      fontSize: isCompact ? 9 : 10,
      color: colors.textSecondary,
    },
  });
