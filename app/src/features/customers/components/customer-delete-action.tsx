import { useRouter } from "expo-router";
import { CustomerResponse } from "@app/shared";

import { DeleteAction } from "@/components/ui/delete-action";
import { useToast } from "@/context/toast.context";
import { useDeleteCustomer } from "@/hooks/use-customers";

type CustomerDeleteActionProps = {
  customer: CustomerResponse;
  onDeleted?: () => void;
};

export function CustomerDeleteAction({
  customer,
  onDeleted,
}: CustomerDeleteActionProps) {
  const router = useRouter();
  const { show } = useToast();
  const deleteCustomer = useDeleteCustomer();

  return (
    <DeleteAction
      label="Excluir cliente"
      title="Excluir cliente"
      message={`Deseja remover ${customer.name}? Vendas vinculadas impedem a exclusão.`}
      onConfirm={async () => {
        await deleteCustomer.mutateAsync(customer.id);
        show("success", "Cliente excluído com sucesso.");

        if (onDeleted) {
          onDeleted();
          return;
        }

        router.replace("/(protected)/customers");
      }}
      onError={(error) => {
        show(
          "error",
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o cliente."
        );
      }}
    />
  );
}
