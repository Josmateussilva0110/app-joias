import { AppShell } from "@/components/appShell";
import { ProductForm } from "@/features/products/components/product-form";

export default function NewProductScreen() {
  return (
    <AppShell title="Nova venda" showBack showSettings>
      <ProductForm />
    </AppShell>
  );
}
