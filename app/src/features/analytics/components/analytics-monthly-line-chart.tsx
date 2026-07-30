import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { useTheme } from "@/context/theme.context";
import type { AnalyticsTrendPoint } from "@app/shared";
import { AnalyticsChartCard } from "./analytics-chart-card";
import {
  formatChartCurrency,
  getChartMaxValue,
} from "../utils/format-chart-currency";
import {
  getAnalyticsAxisLabelStyle,
  getAnalyticsChartColors,
} from "../utils/chart-theme";
import {
  getActiveMonthlyPoints,
  useAnalyticsLayout,
} from "../utils/use-analytics-layout";

type AnalyticsMonthlyLineChartProps = {
  points: AnalyticsTrendPoint[];
};

export function AnalyticsMonthlyLineChart({
  points,
}: AnalyticsMonthlyLineChartProps) {
  const { colors } = useTheme();
  const chartColors = getAnalyticsChartColors(colors);
  const { isCompact, chartWidth } = useAnalyticsLayout();
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact]
  );
  const axisLabelStyle = useMemo(
    () => getAnalyticsAxisLabelStyle(colors, isCompact),
    [colors, isCompact]
  );

  const activePoints = useMemo(
    () => getActiveMonthlyPoints(points),
    [points]
  );

  const chartData = useMemo(
    () =>
      activePoints.map((point) => ({
        value: point.total,
        label: point.label,
        dataPointText: formatChartCurrency(point.total),
      })),
    [activePoints]
  );

  const maxValue = useMemo(
    () => getChartMaxValue(activePoints.map((point) => point.total)),
    [activePoints]
  );

  const lineChartWidth = useMemo(() => {
    const minPointWidth = isCompact ? 52 : 48;
    const computedWidth = activePoints.length * minPointWidth + 16;

    return activePoints.length <= 4
      ? chartWidth
      : Math.max(chartWidth, computedWidth);
  }, [activePoints.length, chartWidth, isCompact]);

  const needsHorizontalScroll = lineChartWidth > chartWidth + 1;

  if (activePoints.length === 0) {
    return null;
  }

  const chart = (
    <LineChart
      data={chartData}
      height={isCompact ? 200 : 220}
      width={lineChartWidth}
      maxValue={maxValue}
      noOfSections={4}
      hideYAxisText
      hideRules
      yAxisThickness={0}
      yAxisLabelWidth={0}
      xAxisLabelTextStyle={axisLabelStyle}
      color={chartColors.primary}
      thickness={3}
      curved
      areaChart
      startFillColor={chartColors.primary}
      endFillColor={chartColors.card}
      startOpacity={0.25}
      endOpacity={0.02}
      dataPointsColor={chartColors.primary}
      dataPointsRadius={isCompact ? 3 : 4}
      xAxisColor={chartColors.grid}
      spacing={isCompact ? 36 : 42}
      initialSpacing={12}
      endSpacing={12}
      scrollToEnd={needsHorizontalScroll}
      pointerConfig={{
        pointerStripColor: chartColors.primary,
        pointerStripWidth: 1,
        pointerColor: chartColors.primary,
        radius: 4,
        pointerLabelComponent: (items: { dataPointText?: string }[]) => {
          const item = items[0];
          if (!item) return null;

          return (
            <View style={[styles.tooltip, { backgroundColor: colors.background }]}>
              <View
                style={[
                  styles.tooltipTextWrap,
                  { borderColor: chartColors.grid },
                ]}
              >
                <Text style={styles.tooltipValue}>{item.dataPointText}</Text>
              </View>
            </View>
          );
        },
      }}
    />
  );

  return (
    <AnalyticsChartCard title="Evolução mensal">
      <View style={styles.chartWrap}>
        {needsHorizontalScroll ? (
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {chart}
          </ScrollView>
        ) : (
          chart
        )}
      </View>
    </AnalyticsChartCard>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  isCompact: boolean
) =>
  StyleSheet.create({
    chartWrap: {
      width: "100%",
      paddingVertical: 4,
    },
    scrollContent: {
      paddingRight: 4,
    },
    tooltip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    tooltipTextWrap: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    tooltipValue: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.text,
    },
  });
