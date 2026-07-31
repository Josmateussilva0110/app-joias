import { useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppShell } from "@/components/appShell";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProductDetailActions } from "@/features/products/components/product-detail-actions";
import { ProductDetailContent } from "@/features/products/components/product-detail-content";
import { useProduct } from "@/hooks/use-products";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id;

  const { data: product, isLoading, isError, error, refetch } =
    useProduct(productId ?? "");

  const handleEdit = useCallback(() => {
    if (!productId) return;

    router.push({
      pathname: "/(protected)/products/[id]/edit",
      params: { id: productId },
    });
  }, [productId, router]);

  if (isLoading) {
    return (
      <AppShell title="Venda" showBack>
        <LoadingState message="Carregando venda..." />
      </AppShell>
    );
  }

  if (isError || !product) {
    return (
      <AppShell title="Venda" showBack>
        <ErrorState
          error={error?.message ?? "Não foi possível carregar a venda."}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Venda" showBack>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProductDetailContent product={product} />
        <ProductDetailActions product={product} onEdit={handleEdit} />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
});
