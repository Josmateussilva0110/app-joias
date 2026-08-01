import { StyleSheet, View } from "react-native";

import { LazyMount } from "@/components/ui/lazy-mount";
import { useTheme } from "@/context/theme.context";
import type { ProductAnalytics } from "@app/shared";
import { AnalyticsEarningsCard } from "./analytics-earnings-card";
import { AnalyticsKpiGrid } from "./analytics-kpi-grid";
import { AnalyticsMonthlyLineChart } from "./analytics-monthly-line-chart";
import { AnalyticsPaymentDonutChart } from "./analytics-payment-donut-chart";
import { AnalyticsHorizontalRankChart } from "./analytics-horizontal-rank-chart";
import { getAnalyticsChartColors } from "../utils/chart-theme";
import { useAnalyticsLayout } from "../utils/use-analytics-layout";

type AnalyticsDashboardProps = {
  analytics: ProductAnalytics;
};

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const { colors } = useTheme();
  const chartColors = getAnalyticsChartColors(colors);
  const { isCompact } = useAnalyticsLayout();

  const hasPaymentData =
    analytics.payment_split.paid.count + analytics.payment_split.unpaid.count > 0;

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      <AnalyticsKpiGrid summary={analytics.summary} />
      <AnalyticsEarningsCard summary={analytics.summary} />

      <LazyMount delayMs={50}>
        <AnalyticsMonthlyLineChart points={analytics.monthly_trend} />
      </LazyMount>

      {hasPaymentData ? (
        <LazyMount delayMs={120}>
          <AnalyticsPaymentDonutChart paymentSplit={analytics.payment_split} />
        </LazyMount>
      ) : null}

      {analytics.top_jewelry.length > 0 ? (
        <LazyMount delayMs={180}>
          <AnalyticsHorizontalRankChart
            title="Top joias"
            items={analytics.top_jewelry}
            barColor={chartColors.primary}
          />
        </LazyMount>
      ) : null}

      <LazyMount delayMs={240}>
        <AnalyticsHorizontalRankChart
          title="Top clientes"
          items={analytics.top_customers}
          barColor={chartColors.accent}
        />
      </LazyMount>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  containerCompact: {
    gap: 12,
  },
});
