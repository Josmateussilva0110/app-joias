import { AppShell } from "@/components/appShell";
import { CustomerForm } from "@/features/customers/components/customer-form";

export default function NewCustomerScreen() {
  return (
    <AppShell title="Novo cliente" showBack>
      <CustomerForm />
    </AppShell>
  );
}
