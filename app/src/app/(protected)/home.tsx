import { useMemo, useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, Gem } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppShell } from "@/components/appShell";
import { HomeHeaderActions } from "@/components/layout/home-header-actions";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ListSectionHeader } from "@/components/ui/list-section-header";
import { StaggeredEntrance } from "@/components/ui/staggered-entrance";
import { ProductListItem } from "@/features/products/components/product-list-item";
import { ProductsSummary } from "@/features/products/components/products-summary";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { toListProductsQuery } from "@/features/products/utils/filter-products";
import { groupProductsByPayment } from "@/features/products/utils/group-products-by-payment";
import { sortProductsDescending } from "@/features/products/utils/sort-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useListLayout } from "@/hooks/use-list-layout";
import { useProducts } from "@/hooks/use-products";
import { useProductFiltersState } from "@/hooks/use-product-filters";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

export default function HomeScreen() {
  const router = useRouter();
  const { horizontalPadding, contentMaxWidth, isCompact } = useListLayout();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, isCompact), [colors, isCompact]);
  const [animateItems, setAnimateItems] = useState(true);
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

  const queryFilters = useMemo(
    () =>
      filters
        ? toListProductsQuery({
            ...filters,
            customerName: debouncedCustomerName,
          })
        : undefined,
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
  } = useProducts(queryFilters, Boolean(filters));

  const firstPage = data?.pages?.[0];
  const products = useMemo(
    () =>
      sortProductsDescending(
        data?.pages?.flatMap((page) => page.items ?? []) ?? []
      ),
    [data]
  );
  const productSections = useMemo(
    () => groupProductsByPayment(products),
    [products]
  );
  const unpaidCount = useMemo(
    () => products.filter((product) => !product.payment_status).length,
    [products]
  );
  const summary = firstPage?.summary ?? { count: 0, total: 0 };
  const hasAnyProduct = firstPage?.has_any ?? false;
  const isInitialLoading = isLoading && !data;

  useEffect(() => {
    if (!animateItems) return;
    const timer = setTimeout(() => setAnimateItems(false), 1200);
    return () => clearTimeout(timer);
  }, [animateItems]);

  useEffect(() => {
    setAnimateItems(true);
  }, [queryFilters]);

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

  if (isLoadingFilters || !filters || !filterOptions) {
    return (
      <AppShell
        title="Vendas"
        subtitle={APP_NAME}
        rightElement={<HomeHeaderActions />}
      >
        <LoadingState message="Carregando filtros..." />
      </AppShell>
    );
  }

  if (isFiltersError) {
    return (
      <AppShell
        title="Vendas"
        subtitle={APP_NAME}
        rightElement={<HomeHeaderActions />}
      >
        <ErrorState
          error={filtersError?.message ?? "Não foi possível carregar os filtros."}
          onRetry={() => refetchFilters()}
        />
      </AppShell>
    );
  }

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
      <View style={[styles.container, contentMaxWidth != null && styles.containerCentered]}>
        <View style={[styles.listWrap, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
        <SectionList
          sections={productSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title, isPaid, data } }) => (
            <ListSectionHeader title={title} isPaid={isPaid} count={data.length} />
          )}
          renderItem={({ item, index, section }) => (
            <StaggeredEntrance index={index} enabled={animateItems}>
              <ProductListItem
                product={item}
                onPress={(product) => handlePressProduct(product.id)}
                isLast={index === section.data.length - 1}
              />
            </StaggeredEntrance>
          )}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 120 + insets.bottom,
            },
            !hasAnyProduct && styles.listContentEmpty,
          ]}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.35}
          stickySectionHeadersEnabled={false}
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
                <StaggeredEntrance variant="header" index={0} enabled={animateItems}>
                  <ProductsSummary summary={summary} unpaidCount={unpaidCount} />
                </StaggeredEntrance>
                <StaggeredEntrance variant="header" index={1} enabled={animateItems}>
                  <ProductsFilters
                    filters={filters}
                    filterOptions={filterOptions}
                    onChange={setFilters}
                  />
                </StaggeredEntrance>
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

        <FloatingActionButton
          bottom={24 + insets.bottom}
          onPress={() => router.push("/(protected)/products/new")}
          icon={<Plus size={28} color={colors.onPrimary} strokeWidth={2.5} />}
        />
        </View>
      </View>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    containerCentered: {
      alignItems: "center",
    },
    listWrap: {
      flex: 1,
      width: "100%",
    },
    listContent: {
      paddingTop: isCompact ? 10 : 12,
    },
    listContentEmpty: {
      flexGrow: 1,
      justifyContent: "center",
    },
    header: {
      gap: isCompact ? 8 : 10,
      marginBottom: 2,
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
  });
