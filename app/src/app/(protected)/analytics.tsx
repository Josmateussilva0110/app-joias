import { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart3 } from "lucide-react-native";
import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";
import { useAnalyticsLayout } from "@/features/analytics/utils/use-analytics-layout";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { toListProductsQuery } from "@/features/products/utils/filter-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProductAnalytics } from "@/hooks/use-product-analytics";
import { useProductFiltersState } from "@/hooks/use-product-filters";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { isCompact, screenPadding } = useAnalyticsLayout();
  const styles = createStyles(colors, isCompact);
  const {
    filters,
    setFilters,
    filterOptions,
    isLoading: isLoadingFilters,
    isError: isFiltersError,
    error: filtersError,
    refetch: refetchFilters,
  } = useProductFiltersState();
  const debouncedCustomerName = useDebouncedValue(filters?.customerName ?? "", 400);
  const debouncedJewelryName = useDebouncedValue(filters?.jewelryName ?? "", 400);

  const queryFilters = useMemo(
    () =>
      filters
        ? toListProductsQuery({
            ...filters,
            customerName: debouncedCustomerName,
            jewelryName: debouncedJewelryName,
          })
        : undefined,
    [filters, debouncedCustomerName, debouncedJewelryName]
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
      <AppShell title="Análise" subtitle="Dashboard de vendas" showBack>
        <LoadingState message="Carregando filtros..." />
      </AppShell>
    );
  }

  if (isFiltersError) {
    return (
      <AppShell title="Análise" subtitle="Dashboard de vendas" showBack>
        <ErrorState
          error={filtersError?.message ?? "Não foi possível carregar os filtros."}
          onRetry={() => refetchFilters()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Análise" subtitle="Dashboard de vendas" showBack>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: horizontalPadding },
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
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
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
