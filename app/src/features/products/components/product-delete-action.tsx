import { useRouter } from "expo-router";
import { ProductResponse } from "@app/shared";

import { DeleteAction } from "@/components/ui/delete-action";
import { useToast } from "@/context/toast.context";
import { useDeleteProduct } from "@/hooks/use-products";
import {
  formatCurrency,
} from "@/features/products/constants/product-labels";

type ProductDeleteActionProps = {
  product: ProductResponse;
  onDeleted?: () => void;
};

export function ProductDeleteAction({
  product,
  onDeleted,
}: ProductDeleteActionProps) {
  const router = useRouter();
  const { show } = useToast();
  const deleteProduct = useDeleteProduct();

  return (
    <DeleteAction
      label="Excluir venda"
      title="Excluir venda"
      message={`Deseja remover a venda de ${product.jewelry_type} (${formatCurrency(product.value)})?`}
      onConfirm={async () => {
        await deleteProduct.mutateAsync(product.id);
        show("success", "Venda excluída com sucesso.");

        if (onDeleted) {
          onDeleted();
          return;
        }

        router.replace("/(protected)/home");
      }}
      onError={(error) => {
        show(
          "error",
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a venda."
        );
      }}
    />
  );
}
