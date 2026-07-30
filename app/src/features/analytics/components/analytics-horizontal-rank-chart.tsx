import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/context/theme.context";
import type { AnalyticsRankItem } from "@app/shared";
import { AnalyticsChartCard } from "./analytics-chart-card";
import {
  formatChartCurrency,
  getChartMaxValue,
} from "../utils/format-chart-currency";
import { getAnalyticsChartColors } from "../utils/chart-theme";
import { useAnalyticsLayout } from "../utils/use-analytics-layout";

type AnalyticsHorizontalRankChartProps = {
  title: string;
  items: AnalyticsRankItem[];
  barColor: string;
};

type RankRowProps = {
  item: AnalyticsRankItem;
  rank: number;
  fillRatio: number;
  barColor: string;
  colors: ReturnType<typeof useTheme>["colors"];
  chartColors: ReturnType<typeof getAnalyticsChartColors>;
  isCompact: boolean;
};

function RankRow({
  item,
  rank,
  fillRatio,
  barColor,
  colors,
  chartColors,
  isCompact,
}: RankRowProps) {
  const styles = useMemo(
    () => createRowStyles(colors, isCompact),
    [colors, isCompact]
  );
  const fillWidth = `${Math.max(fillRatio * 100, fillRatio > 0 ? 5 : 0)}%`;

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={styles.labelGroup}>
          <View
            style={[
              styles.rankBadge,
              {
                backgroundColor: `${barColor}22`,
                borderColor: `${barColor}44`,
              },
            ]}
          >
            <Text style={[styles.rankText, { color: barColor }]}>{rank}</Text>
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        <Text style={styles.value}>{formatChartCurrency(item.total)}</Text>
      </View>

      <View style={[styles.track, { backgroundColor: chartColors.grid }]}>
        <LinearGradient
          colors={[barColor, `${barColor}BB`]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.bar, { width: fillWidth }]}
        />
      </View>
    </View>
  );
}

export function AnalyticsHorizontalRankChart({
  title,
  items,
  barColor,
}: AnalyticsHorizontalRankChartProps) {
  const { colors } = useTheme();
  const chartColors = getAnalyticsChartColors(colors);
  const { isCompact } = useAnalyticsLayout();
  const styles = useMemo(
    () => createStyles(isCompact),
    [isCompact]
  );

  const maxValue = useMemo(
    () => getChartMaxValue(items.map((item) => item.total)),
    [items]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <AnalyticsChartCard title={title}>
      <View style={styles.list}>
        {items.map((item, index) => (
          <RankRow
            key={`${item.name}-${index}`}
            item={item}
            rank={index + 1}
            fillRatio={maxValue > 0 ? item.total / maxValue : 0}
            barColor={barColor}
            colors={colors}
            chartColors={chartColors}
            isCompact={isCompact}
          />
        ))}
      </View>
    </AnalyticsChartCard>
  );
}

const createStyles = (isCompact: boolean) =>
  StyleSheet.create({
    list: {
      gap: isCompact ? 14 : 16,
    },
  });

const createRowStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  isCompact: boolean
) =>
  StyleSheet.create({
    row: {
      gap: isCompact ? 6 : 8,
    },
    rowHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    labelGroup: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: isCompact ? 8 : 10,
      minWidth: 0,
    },
    rankBadge: {
      width: isCompact ? 22 : 24,
      height: isCompact ? 22 : 24,
      borderRadius: 999,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    rankText: {
      fontSize: isCompact ? 10 : 11,
      fontWeight: "800",
    },
    label: {
      flex: 1,
      fontSize: isCompact ? 12 : 13,
      fontWeight: "600",
      color: colors.text,
      lineHeight: isCompact ? 17 : 18,
    },
    value: {
      fontSize: isCompact ? 11 : 12,
      fontWeight: "800",
      color: colors.textSecondary,
      flexShrink: 0,
      paddingTop: 2,
    },
    track: {
      height: isCompact ? 8 : 10,
      borderRadius: 999,
      overflow: "hidden",
    },
    bar: {
      height: "100%",
      borderRadius: 999,
      minWidth: 4,
    },
  });
