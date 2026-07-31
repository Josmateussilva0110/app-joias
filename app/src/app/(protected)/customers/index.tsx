import { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomerResponse } from "@app/shared";
import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ListSectionHeader } from "@/components/ui/list-section-header";
import { StaggeredEntrance } from "@/components/ui/staggered-entrance";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { CustomerListItem } from "@/features/customers/components/customer-list-item";
import { CustomersEmptyState } from "@/features/customers/components/customers-empty-state";
import { CustomersSearch } from "@/features/customers/components/customers-search";
import { CustomersSummary } from "@/features/customers/components/customers-summary";
import { filterCustomersByName } from "@/features/customers/utils/filter-customers";
import { groupCustomersByLetter } from "@/features/customers/utils/group-customers-by-letter";
import { useCustomers } from "@/hooks/use-customers";
import { useListLayout } from "@/hooks/use-list-layout";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

export default function CustomersScreen() {
  const router = useRouter();
  const { horizontalPadding, contentMaxWidth, isCompact } = useListLayout();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(isCompact);
  const [searchName, setSearchName] = useState("");

  const { data: customers, isLoading, isError, error, refetch, isRefetching } =
    useCustomers();

  const allCustomers = customers ?? [];
  const list = useMemo(
    () => filterCustomersByName(allCustomers, searchName),
    [allCustomers, searchName]
  );
  const customerSections = useMemo(
    () => groupCustomersByLetter(list),
    [list]
  );
  const hasCustomers = allCustomers.length > 0;
  const isSearching = searchName.trim().length > 0;

  const handlePressCustomer = (customer: CustomerResponse) => {
    router.push({
      pathname: "/(protected)/customers/[id]",
      params: { id: customer.id },
    });
  };

  const headerActions = (
    <View style={styles.headerActions}>
      <AnimatedPressable
        onPress={() => router.push("/(protected)/profile")}
        style={[styles.headerButton, { backgroundColor: colors.backgroundElement }]}
      >
        <Settings size={18} color={colors.textSecondary} />
      </AnimatedPressable>
    </View>
  );

  if (isLoading) {
    return (
      <AppShell title="Clientes" subtitle={APP_NAME} showBack rightElement={headerActions}>
        <LoadingState message="Carregando clientes..." />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="Clientes" subtitle={APP_NAME} showBack rightElement={headerActions}>
        <ErrorState
          error={error?.message ?? "Não foi possível carregar os clientes."}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Clientes" subtitle={APP_NAME} showBack rightElement={headerActions}>
      <View style={[styles.container, contentMaxWidth != null && styles.containerCentered]}>
        <View style={[styles.listWrap, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <SectionList
            sections={customerSections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title, data } }) => (
              <ListSectionHeader title={title} count={data.length} />
            )}
            renderItem={({ item, index, section }) => (
              <StaggeredEntrance index={index}>
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
                paddingBottom: 120 + insets.bottom,
              },
              list.length === 0 && styles.listContentEmpty,
            ]}
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
                <StaggeredEntrance variant="header" index={0}>
                  <CustomersSummary count={allCustomers.length} />
                </StaggeredEntrance>
                {hasCustomers ? (
                  <StaggeredEntrance variant="header" index={1}>
                    <CustomersSearch value={searchName} onChange={setSearchName} />
                  </StaggeredEntrance>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              <CustomersEmptyState variant={isSearching ? "no-results" : "empty"} />
            }
          />

          <FloatingActionButton
            bottom={24 + insets.bottom}
            onPress={() => router.push("/(protected)/customers/new")}
            icon={<Plus size={28} color={colors.onPrimary} strokeWidth={2.5} />}
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
    header: {
      paddingTop: isCompact ? 10 : 12,
      paddingBottom: 8,
      gap: isCompact ? 8 : 10,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    listContent: {
      flexGrow: 1,
    },
    listContentEmpty: {
      justifyContent: "center",
    },
  });
