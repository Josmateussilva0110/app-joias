import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { DollarSign, PlusCircle, Gem, CircleDollarSign, Save } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { DateField } from "@/components/ui/date-field";
import { CustomerSelectField } from "@/features/customers/components/customer-select-field";
import { ToggleRow } from "@/components/ui/toggle.row";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCustomerPicker } from "@/hooks/use-customers";
import {
  productEditFormSchema,
  productFormSchema,
  toCreateProductDTO,
  toUpdateProductDTO,
  type ProductEditFormData,
  type ProductFormData,
} from "@/schemas/product.schema";

type ProductFormProps = {
  mode?: "create" | "edit";
  productId?: string;
  defaultValues?: ProductFormData | ProductEditFormData;
};

export function ProductForm({
  mode = "create",
  productId,
  defaultValues,
}: ProductFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId ?? "");
  const isEditMode = mode === "edit";
  const {
    data: customers,
    isLoading: isLoadingCustomers,
    isError: isCustomersError,
    error: customersError,
    refetch: refetchCustomers,
  } = useCustomerPicker();

  const hasCustomers = (customers?.length ?? 0) > 0;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData | ProductEditFormData>({
    resolver: zodResolver(isEditMode ? productEditFormSchema : productFormSchema),
    defaultValues: defaultValues ?? {
      jewelry_type: "",
      customer_id: "",
      value: "",
      payment_status: false,
    },
  });

  const isPaid = watch("payment_status");
  const isPending = isEditMode ? updateProduct.isPending : createProduct.isPending;

  const onSubmit = async (data: ProductFormData | ProductEditFormData) => {
    try {
      if (isEditMode) {
        if (!productId) {
          throw new Error("Venda inválida.");
        }

        await updateProduct.mutateAsync(toUpdateProductDTO(data as ProductEditFormData));
        show("success", "Venda atualizada com sucesso!");
      } else {
        await createProduct.mutateAsync(toCreateProductDTO(data));
        show("success", "Venda registrada com sucesso!");
      }

      router.back();
    } catch (error) {
      show(
        "error",
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Não foi possível atualizar a venda."
            : "Não foi possível registrar a venda."
      );
    }
  };

  const onInvalid = () => {
    const firstError = Object.values(errors)[0]?.message;
    if (firstError) {
      show("error", firstError);
    }
  };

  if (isLoadingCustomers) {
    return <LoadingState message="Carregando clientes..." />;
  }

  if (isCustomersError) {
    return (
      <ErrorState
        error={customersError?.message ?? "Não foi possível carregar os clientes."}
        onRetry={() => refetchCustomers()}
      />
    );
  }

  if (!hasCustomers) {
    return (
      <View style={styles.emptyCustomers}>
        <Text style={styles.emptyTitle}>Nenhum cliente cadastrado</Text>
        <Text style={styles.emptyDescription}>
          Cadastre um cliente antes de registrar uma venda.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(protected)/customers/new")}
          activeOpacity={0.85}
          style={styles.emptyLink}
        >
          <Text style={styles.emptyLinkText}>Cadastrar cliente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="jewelry_type"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Joia*"
            icon={Gem}
            error={errors.jewelry_type?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Ex: Colar de ouro"
            autoCapitalize="sentences"
            returnKeyType="next"
          />
        )}
      />

      <Controller
        control={control}
        name="customer_id"
        render={({ field: { value, onChange } }) => (
          <CustomerSelectField
            customers={customers ?? []}
            value={value}
            onChange={onChange}
            placeholder="Selecione um cliente"
            error={errors.customer_id?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="value"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Valor*"
            icon={DollarSign}
            error={errors.value?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="0,00"
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        )}
      />

      {isEditMode ? (
        <Controller
          control={control}
          name="purchase_date"
          render={({ field: { onChange, onBlur, value } }) => (
            <DateField
              label="Data da compra*"
              error={errors.purchase_date?.message}
              value={value ?? ""}
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pagamento</Text>
        <ToggleRow
          icon={CircleDollarSign}
          label="Pago"
          hint={isPaid ? "Pagamento recebido" : "Cliente ainda deve"}
          value={isPaid}
          onChange={(paid) =>
            setValue("payment_status", paid, {
              shouldValidate: true,
            })
          }
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit, onInvalid)}
        disabled={isSubmitting || isPending}
        activeOpacity={0.85}
        style={(isSubmitting || isPending) && styles.buttonDisabled}
      >
        <LinearGradient
          colors={[colors.primary, "#9A7840"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          {isEditMode ? (
            <Save size={18} color={colors.onPrimary} />
          ) : (
            <PlusCircle size={18} color={colors.onPrimary} />
          )}
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isSubmitting || isPending
              ? "Salvando..."
              : isEditMode
                ? "Salvar alterações"
                : "Registrar venda"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 24,
      gap: 20,
      paddingBottom: 40,
    },
    emptyCustomers: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: "center",
    },
    emptyLink: {
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.primaryMuted,
    },
    emptyLinkText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
    },
    section: {
      gap: 10,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    button: {
      height: 52,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });
