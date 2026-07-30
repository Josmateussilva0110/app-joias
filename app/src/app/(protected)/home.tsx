import { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Gem } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppShell } from "@/components/appShell";
import { HomeHeaderActions } from "@/components/layout/home-header-actions";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProductListItem } from "@/features/products/components/product-list-item";
import { ProductsSummary } from "@/features/products/components/products-summary";
import { ProductsFilters } from "@/features/products/components/products-filters";
import {
  getDefaultProductFilters,
  toListProductsQuery,
} from "@/features/products/utils/filter-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProducts } from "@/hooks/use-products";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [filters, setFilters] = useState(getDefaultProductFilters);
  const debouncedCustomerName = useDebouncedValue(filters.customerName, 400);

  const queryFilters = useMemo(
    () =>
      toListProductsQuery({
        ...filters,
        customerName: debouncedCustomerName,
      }),
    [filters, debouncedCustomerName]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(queryFilters);

  const horizontalPadding = width < 380 ? 16 : 24;
  const firstPage = data?.pages?.[0];
  const products = useMemo(
    () => data?.pages?.flatMap((page) => page.items ?? []) ?? [],
    [data]
  );
  const summary = firstPage?.summary ?? { count: 0, total: 0 };
  const hasAnyProduct = firstPage?.has_any ?? false;
  const isInitialLoading = isLoading && !data;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePressProduct = (productId: string) => {
    router.push({
      pathname: "/(protected)/products/[id]",
      params: { id: productId },
    });
  };

  if (isInitialLoading) {
    return (
      <AppShell
        title="Vendas"
        subtitle={APP_NAME}
        rightElement={<HomeHeaderActions />}
      >
        <LoadingState message="Carregando vendas..." />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell
        title="Vendas"
        subtitle={APP_NAME}
        rightElement={<HomeHeaderActions />}
      >
        <ErrorState
          error={error?.message ?? "Não foi possível carregar as vendas."}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Vendas" subtitle={APP_NAME} rightElement={<HomeHeaderActions />}>
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductListItem
              product={item}
              onPress={() => handlePressProduct(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 120 + insets.bottom,
            },
            !hasAnyProduct && styles.listContentEmpty,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            hasAnyProduct ? (
              <View style={styles.header}>
                <ProductsSummary summary={summary} />
                <ProductsFilters
                  filters={filters}
                  availableYears={firstPage?.available_years}
                  onChange={setFilters}
                />
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.footerLoaderText}>Carregando mais vendas...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            hasAnyProduct ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhuma venda encontrada</Text>
                <Text style={styles.emptyDescription}>
                  Ajuste os filtros de cliente, categoria, pagamento, mês ou ano.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Gem size={28} color={colors.emptyIcon} strokeWidth={1.75} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma venda ainda</Text>
                <Text style={styles.emptyDescription}>
                  Toque no botão + para registrar sua primeira venda de joias.
                </Text>
              </View>
            )
          }
        />

        <TouchableOpacity
          onPress={() => router.push("/(protected)/products/new")}
          activeOpacity={0.9}
          style={[styles.fab, { bottom: 24 + insets.bottom }]}
        >
          <LinearGradient
            colors={[colors.fabGradientStart, colors.fabGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Plus size={28} color={colors.onPrimary} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingTop: 16,
    },
    listContentEmpty: {
      flexGrow: 1,
      justifyContent: "center",
    },
    header: {
      gap: 12,
      marginBottom: 16,
    },
    separator: {
      height: 12,
    },
    footerLoader: {
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 20,
    },
    footerLoaderText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 32,
      borderRadius: 22,
      borderWidth: 1,
      backgroundColor: colors.emptyBg,
      borderColor: colors.emptyBorder,
    },
    emptyIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.emptyIconBg,
    },
    emptyTitle: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: "800",
      color: colors.emptyTitle,
      textAlign: "center",
    },
    emptyDescription: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: colors.emptyDescription,
      textAlign: "center",
    },
    fab: {
      position: "absolute",
      right: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    fabGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
  });
