import { useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { CustomerDetailActions } from "@/features/customers/components/customer-detail-actions";
import { CustomerDetailContent } from "@/features/customers/components/customer-detail-content";
import { useCustomer } from "@/hooks/use-customers";

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Array.isArray(id) ? id[0] : id;

  const { data: customer, isLoading, isError, error, refetch } =
    useCustomer(customerId ?? "");

  const handleEdit = useCallback(() => {
    if (!customerId) return;

    router.push({
      pathname: "/(protected)/customers/[id]/edit",
      params: { id: customerId },
    });
  }, [customerId, router]);

  if (isLoading) {
    return (
      <AppShell title="Cliente" showBack>
        <LoadingState message="Carregando cliente..." />
      </AppShell>
    );
  }

  if (isError || !customer) {
    return (
      <AppShell title="Cliente" showBack>
        <ErrorState
          error={error?.message ?? "Não foi possível carregar o cliente."}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Cliente" showBack>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CustomerDetailContent customer={customer} />
        <CustomerDetailActions customer={customer} onEdit={handleEdit} />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
});
