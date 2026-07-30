import { useLocalSearchParams } from "expo-router";

import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProductForm } from "@/features/products/components/product-form";
import { toProductFormData } from "@/schemas/product.schema";
import { useProduct } from "@/hooks/use-products";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id;

  const { data: product, isLoading, isError, error, refetch } =
    useProduct(productId ?? "");

  if (isLoading) {
    return (
      <AppShell title="Editar venda" showBack>
        <LoadingState message="Carregando venda..." />
      </AppShell>
    );
  }

  if (isError || !product) {
    return (
      <AppShell title="Editar venda" showBack>
        <ErrorState
          error={error?.message ?? "Não foi possível carregar a venda."}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Editar venda" showBack>
      <ProductForm
        mode="edit"
        productId={product.id}
        defaultValues={toProductFormData(product)}
      />
    </AppShell>
  );
}
