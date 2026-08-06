import { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { CustomerResponse } from "@app/shared";
import { AppShell } from "@/components/appShell";
import { HomeBottomNav, BOTTOM_NAV_FAB_CLEARANCE } from "@/components/layout/home-bottom-nav";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ListSectionHeader } from "@/components/ui/list-section-header";
import { StaggeredEntrance } from "@/components/ui/staggered-entrance";
import { CustomerListItem } from "@/features/customers/components/customer-list-item";
import { CustomersEmptyState } from "@/features/customers/components/customers-empty-state";
import { CustomersSearch } from "@/features/customers/components/customers-search";
import { CustomersSummary } from "@/features/customers/components/customers-summary";
import { groupCustomersByLetter } from "@/features/customers/utils/group-customers-by-letter";
import { useCustomers } from "@/hooks/use-customers";
import { useListLayout } from "@/hooks/use-list-layout";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

export default function CustomersScreen() {
  const router = useRouter();
  const { horizontalPadding, contentMaxWidth, isCompact } = useListLayout();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(isCompact), [isCompact]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [animateItems, setAnimateItems] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(52);

  const listFilters = useMemo(
    () => (searchQuery.trim() ? { name: searchQuery.trim() } : undefined),
    [searchQuery]
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
  } = useCustomers(listFilters);

  useEffect(() => {
    if (!animateItems) return;
    const timer = setTimeout(() => setAnimateItems(false), 800);
    return () => clearTimeout(timer);
  }, [animateItems]);

  const firstPage = data?.pages?.[0];
  const allCustomers = useMemo(
    () => data?.pages?.flatMap((page) => page.items ?? []) ?? [],
    [data]
  );
  const totalCount = firstPage?.total ?? allCustomers.length;
  const customerSections = useMemo(
    () => groupCustomersByLetter(allCustomers),
    [allCustomers]
  );
  const hasCustomers = totalCount > 0;
  const isSearching = searchQuery.trim().length > 0;
  const showSearch = hasCustomers || isSearching || searchInput.trim().length > 0;
  const isInitialLoading = isLoading && !data;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePressCustomer = (customer: CustomerResponse) => {
    router.push({
      pathname: "/(protected)/customers/[id]",
      params: { id: customer.id },
    });
  };

  if (isInitialLoading) {
    return (
      <AppShell title="Clientes" subtitle={APP_NAME}>
        <LoadingState message="Carregando clientes..." />
      </AppShell>
    );
  }

  if (isError && !data) {
    return (
      <AppShell title="Clientes" subtitle={APP_NAME}>
        <ErrorState
          error={error?.message ?? "Não foi possível carregar os clientes."}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Clientes" subtitle={APP_NAME}>
      <View style={[styles.container, contentMaxWidth != null && styles.containerCentered]}>
        <View style={[styles.listWrap, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <SectionList
            style={styles.list}
            sections={customerSections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title, data: sectionData } }) => (
              <ListSectionHeader title={title} count={sectionData.length} />
            )}
            renderItem={({ item, index, section }) => (
              <StaggeredEntrance index={index} enabled={animateItems}>
                <CustomerListItem
                  customer={item}
                  onPress={handlePressCustomer}
                  isLast={index === section.data.length - 1}
                />
              </StaggeredEntrance>
            )}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingHorizontal: horizontalPadding,
                paddingBottom: bottomPanelHeight + BOTTOM_NAV_FAB_CLEARANCE,
              },
              allCustomers.length === 0 && styles.listContentEmpty,
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
              <View style={styles.header}>
                <StaggeredEntrance variant="header" index={0} enabled={animateItems}>
                  <CustomersSummary count={totalCount} />
                </StaggeredEntrance>
                {showSearch ? (
                  <StaggeredEntrance variant="header" index={1} enabled={animateItems}>
                    <CustomersSearch
                      value={searchInput}
                      onChange={setSearchInput}
                      onSubmit={(value) => setSearchQuery(value.trim())}
                    />
                  </StaggeredEntrance>
                ) : null}
                {isError ? (
                  <View style={styles.searchError}>
                    <Text style={[styles.searchErrorText, { color: colors.error }]}>
                      {error?.message ?? "Não foi possível buscar os clientes."}
                    </Text>
                    <Text
                      onPress={() => refetch()}
                      style={[styles.searchErrorRetry, { color: colors.primary }]}
                    >
                      Tentar novamente
                    </Text>
                  </View>
                ) : null}
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[styles.footerLoaderText, { color: colors.textSecondary }]}>
                    Carregando mais clientes...
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <CustomersEmptyState variant={isSearching ? "no-results" : "empty"} />
            }
          />

          <FloatingActionButton
            bottom={bottomPanelHeight + 12}
            onPress={() => router.push("/(protected)/customers/new")}
            icon={<Plus size={28} color={colors.onPrimary} strokeWidth={2.5} />}
          />

          <HomeBottomNav
            style={styles.bottomNav}
            onLayoutHeight={setBottomPanelHeight}
          />
        </View>
      </View>
    </AppShell>
  );
}

const createStyles = (isCompact: boolean) =>
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
    bottomNav: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },
    list: {
      flex: 1,
    },
    header: {
      paddingTop: isCompact ? 10 : 12,
      paddingBottom: 8,
      gap: isCompact ? 8 : 10,
    },
    searchError: {
      gap: 4,
      paddingVertical: 4,
    },
    searchErrorText: {
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
    searchErrorRetry: {
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
    listContent: {
      flexGrow: 1,
    },
    listContentEmpty: {
      justifyContent: "center",
    },
    footerLoader: {
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 20,
    },
    footerLoaderText: {
      fontSize: 13,
    },
  });
