import { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart3 } from "lucide-react-native";
import { AppShell } from "@/components/appShell";
import { HomeBottomNav } from "@/components/layout/home-bottom-nav";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";
import { useAnalyticsLayout } from "@/features/analytics/utils/use-analytics-layout";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { toListProductsQuery } from "@/features/products/utils/filter-products";
import { useProductAnalytics } from "@/hooks/use-product-analytics";
import { useProductFiltersState } from "@/hooks/use-product-filters";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { isCompact, screenPadding } = useAnalyticsLayout();
  const styles = useMemo(() => createStyles(colors, isCompact), [colors, isCompact]);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(52);
  const {
    filters,
    setFilters,
    filterOptions,
    isLoading: isLoadingFilters,
    isError: isFiltersError,
    error: filtersError,
    refetch: refetchFilters,
  } = useProductFiltersState();
  const queryFilters = useMemo(
    () => (filters ? toListProductsQuery(filters) : undefined),
    [
      filters?.customerName,
      filters?.jewelryName,
      filters?.payment,
      filters?.month,
      filters?.year,
    ]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useProductAnalytics(queryFilters, Boolean(filters));

  const horizontalPadding = screenPadding;
  const hasData = (data?.summary.count ?? 0) > 0;

  if (isLoadingFilters || !filters || !filterOptions) {
    return (
      <AppShell title="Análise" subtitle="Dashboard de vendas">
        <LoadingState message="Carregando filtros..." />
      </AppShell>
    );
  }

  if (isFiltersError) {
    return (
      <AppShell title="Análise" subtitle="Dashboard de vendas">
        <ErrorState
          error={filtersError?.message ?? "Não foi possível carregar os filtros."}
          onRetry={() => refetchFilters()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Análise" subtitle="Dashboard de vendas">
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: bottomPanelHeight + 12,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
                void refetchFilters();
              }}
              tintColor={colors.primary}
            />
          }
        >
          <ProductsFilters
            filters={filters}
            filterOptions={filterOptions}
            onChange={setFilters}
          />

          {isLoading ? <LoadingState message="Carregando análise..." /> : null}

          {isError ? (
            <ErrorState
              error={error?.message ?? "Não foi possível carregar a análise."}
              onRetry={() => refetch()}
            />
          ) : null}

          {!isLoading && !isError && data && hasData ? (
            <AnalyticsDashboard analytics={data} />
          ) : null}

          {!isLoading && !isError && data && !hasData ? (
            <View style={styles.emptyState}>
              <BarChart3 size={40} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Nenhuma venda no período</Text>
              <Text style={styles.emptyDescription}>
                Ajuste os filtros ou registre vendas para ver os gráficos.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <HomeBottomNav
          style={styles.bottomNav}
          onLayoutHeight={setBottomPanelHeight}
        />
      </View>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    bottomNav: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingTop: isCompact ? 12 : 16,
      paddingBottom: 32,
      gap: isCompact ? 12 : 16,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: 280,
    },
  });
