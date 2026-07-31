import { useLocalSearchParams } from "expo-router";
import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { toCustomerFormData } from "@/schemas/customer.schema";
import { useCustomer } from "@/hooks/use-customers";

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Array.isArray(id) ? id[0] : id;

  const { data: customer, isLoading, isError, error, refetch } =
    useCustomer(customerId ?? "");

  if (isLoading) {
    return (
      <AppShell title="Editar cliente" showBack>
        <LoadingState message="Carregando cliente..." />
      </AppShell>
    );
  }

  if (isError || !customer) {
    return (
      <AppShell title="Editar cliente" showBack>
        <ErrorState
          error={error?.message ?? "Não foi possível carregar o cliente."}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Editar cliente" showBack>
      <CustomerForm
        mode="edit"
        customerId={customer.id}
        defaultValues={toCustomerFormData(customer)}
      />
    </AppShell>
  );
}
