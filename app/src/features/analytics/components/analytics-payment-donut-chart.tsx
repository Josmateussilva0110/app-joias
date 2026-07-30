import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import { useTheme } from "@/context/theme.context";
import type { ProductAnalytics } from "@app/shared";
import { formatCurrency } from "@/features/products/constants/product-labels";
import { AnalyticsChartCard } from "./analytics-chart-card";
import { getAnalyticsChartColors } from "../utils/chart-theme";
import { useAnalyticsLayout } from "../utils/use-analytics-layout";

type AnalyticsPaymentDonutChartProps = {
  paymentSplit: ProductAnalytics["payment_split"];
};

export function AnalyticsPaymentDonutChart({
  paymentSplit,
}: AnalyticsPaymentDonutChartProps) {
  const { colors } = useTheme();
  const chartColors = getAnalyticsChartColors(colors);
  const { isCompact } = useAnalyticsLayout();
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact]
  );

  const radius = isCompact ? 72 : 84;
  const innerRadius = isCompact ? 48 : 56;

  const pieData = [
    {
      value: paymentSplit.paid.total,
      color: chartColors.success,
      text: "Pago",
    },
    {
      value: paymentSplit.unpaid.total,
      color: chartColors.danger,
      text: "Devendo",
    },
  ].filter((item) => item.value > 0);

  return (
    <AnalyticsChartCard title="Pago vs Devendo">
      <View style={styles.content}>
        <PieChart
          data={pieData}
          donut
          radius={radius}
          innerRadius={innerRadius}
          innerCircleColor={colors.backgroundElement}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerValue}>
                {formatCurrency(paymentSplit.paid.total + paymentSplit.unpaid.total)}
              </Text>
              <Text style={styles.centerHint}>Total</Text>
            </View>
          )}
        />

        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: chartColors.success }]} />
            <Text style={styles.legendText}>
              Pago: {formatCurrency(paymentSplit.paid.total)} ({paymentSplit.paid.count})
            </Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: chartColors.danger }]} />
            <Text style={styles.legendText}>
              Devendo: {formatCurrency(paymentSplit.unpaid.total)} ({paymentSplit.unpaid.count})
            </Text>
          </View>
        </View>
      </View>
    </AnalyticsChartCard>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  isCompact: boolean
) =>
  StyleSheet.create({
    content: {
      alignItems: "center",
      gap: isCompact ? 12 : 16,
    },
    centerLabel: {
      alignItems: "center",
      gap: 2,
    },
    centerValue: {
      fontSize: isCompact ? 12 : 13,
      fontWeight: "800",
      color: colors.text,
    },
    centerHint: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    legend: {
      width: "100%",
      gap: 8,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    legendText: {
      flex: 1,
      fontSize: isCompact ? 12 : 13,
      color: colors.textSecondary,
    },
  });
