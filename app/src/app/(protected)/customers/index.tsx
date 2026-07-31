import { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomerResponse } from "@app/shared";
import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { CustomerListItem } from "@/features/customers/components/customer-list-item";
import { CustomersEmptyState } from "@/features/customers/components/customers-empty-state";
import { CustomersSearch } from "@/features/customers/components/customers-search";
import { CustomersSummary } from "@/features/customers/components/customers-summary";
import { filterCustomersByName } from "@/features/customers/utils/filter-customers";
import { useCustomers } from "@/hooks/use-customers";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

export default function CustomersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [searchName, setSearchName] = useState("");

  const { data: customers, isLoading, isError, error, refetch, isRefetching } =
    useCustomers();

  const horizontalPadding = width < 380 ? 16 : 24;
  const allCustomers = customers ?? [];
  const list = useMemo(
    () => filterCustomersByName(allCustomers, searchName),
    [allCustomers, searchName]
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
      <TouchableOpacity
        onPress={() => router.push("/(protected)/profile")}
        activeOpacity={0.7}
        style={[styles.headerButton, { backgroundColor: colors.backgroundElement }]}
      >
        <Settings size={18} color={colors.textSecondary} />
      </TouchableOpacity>
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
      <View style={styles.container}>
        <View style={[styles.fixedHeader, { paddingHorizontal: horizontalPadding }]}>
          <CustomersSummary count={allCustomers.length} />
          {hasCustomers ? (
            <CustomersSearch value={searchName} onChange={setSearchName} />
          ) : null}
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerListItem customer={item} onPress={handlePressCustomer} />
          )}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 120 + insets.bottom,
            },
            list.length === 0 && styles.listContentEmpty,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <CustomersEmptyState variant={isSearching ? "no-results" : "empty"} />
          }
        />

        <TouchableOpacity
          onPress={() => router.push("/(protected)/customers/new")}
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
    fixedHeader: {
      paddingTop: 16,
      paddingBottom: 12,
      gap: 12,
    },
    list: {
      flex: 1,
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
    separator: {
      height: 12,
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
