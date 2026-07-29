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
import { User, DollarSign, PlusCircle, Gem, CircleDollarSign } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { ToggleRow } from "@/components/ui/toggle.row";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useCreateProduct } from "@/hooks/use-products";
import {
  productFormSchema,
  toCreateProductDTO,
  type ProductFormData,
} from "@/schemas/product.schema";
import { JEWELRY_TYPE_OPTIONS } from "../constants/product-labels";

export function ProductForm() {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const createProduct = useCreateProduct();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      jewelry_type: "colar",
      customer_name: "",
      value: "",
      payment_status: false,
    },
  });

  const isPaid = watch("payment_status");

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct.mutateAsync(toCreateProductDTO(data));
      show("success", "Venda registrada com sucesso!");
      router.back();
    } catch (error) {
      show(
        "error",
        error instanceof Error ? error.message : "Não foi possível registrar a venda."
      );
    }
  };

  const onInvalid = () => {
    const firstError = Object.values(errors)[0]?.message;
    if (firstError) {
      show("error", firstError);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="jewelry_type"
        render={({ field: { value, onChange } }) => (
          <SelectField
            label="Tipo de joia*"
            icon={Gem}
            value={value}
            options={JEWELRY_TYPE_OPTIONS}
            onChange={onChange}
            error={errors.jewelry_type?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="customer_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Cliente*"
            icon={User}
            error={errors.customer_name?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Nome do cliente"
            autoCapitalize="words"
            returnKeyType="next"
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
        disabled={isSubmitting || createProduct.isPending}
        activeOpacity={0.85}
        style={(isSubmitting || createProduct.isPending) && styles.buttonDisabled}
      >
        <LinearGradient
          colors={[colors.primary, "#9A7840"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <PlusCircle size={18} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isSubmitting || createProduct.isPending
              ? "Salvando..."
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
