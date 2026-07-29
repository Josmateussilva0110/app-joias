import { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
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
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

export default function CustomersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { show } = useToast();
  const styles = createStyles(colors);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: customers, isLoading, isError, error, refetch, isRefetching } =
    useCustomers();
  const deleteCustomer = useDeleteCustomer();

  const horizontalPadding = width < 380 ? 16 : 24;
  const list = customers ?? [];

  const handleDelete = useCallback(
    (customer: CustomerResponse) => {
      Alert.alert(
        "Excluir cliente",
        `Deseja remover ${customer.name}? Vendas vinculadas impedem a exclusão.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingId(customer.id);
                await deleteCustomer.mutateAsync(customer.id);
                show("success", "Cliente excluído com sucesso.");
              } catch (deleteError) {
                show(
                  "error",
                  deleteError instanceof Error
                    ? deleteError.message
                    : "Não foi possível excluir o cliente."
                );
              } finally {
                setDeletingId(null);
              }
            },
          },
        ]
      );
    },
    [deleteCustomer, show]
  );

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
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerListItem
              customer={item}
              onDelete={handleDelete}
              isDeleting={deletingId === item.id}
            />
          )}
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
          ListEmptyComponent={<CustomersEmptyState />}
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
      paddingTop: 16,
    },
    listContentEmpty: {
      flexGrow: 1,
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
