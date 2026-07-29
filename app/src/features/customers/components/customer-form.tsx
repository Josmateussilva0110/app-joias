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
import { User, Phone, UserPlus, Save } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { DateField } from "@/components/ui/date-field";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import {
  customerFormSchema,
  toCreateCustomerDTO,
  toUpdateCustomerDTO,
  type CustomerFormData,
} from "@/schemas/customer.schema";
import { formatPhoneInput } from "@/features/customers/utils/phone-mask";

type CustomerFormProps = {
  mode?: "create" | "edit";
  customerId?: string;
  defaultValues?: CustomerFormData;
};

export function CustomerForm({
  mode = "create",
  customerId,
  defaultValues,
}: CustomerFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customerId ?? "");
  const isEditMode = mode === "edit";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      phone: "",
      birth_date: "",
    },
  });

  const isPending = isEditMode
    ? updateCustomer.isPending
    : createCustomer.isPending;

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditMode) {
        if (!customerId) {
          throw new Error("Cliente inválido.");
        }

        await updateCustomer.mutateAsync(toUpdateCustomerDTO(data));
        show("success", "Cliente atualizado com sucesso!");
      } else {
        await createCustomer.mutateAsync(toCreateCustomerDTO(data));
        show("success", "Cliente cadastrado com sucesso!");
      }

      router.back();
    } catch (error) {
      show(
        "error",
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Não foi possível atualizar o cliente."
            : "Não foi possível cadastrar o cliente."
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
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Nome*"
            icon={User}
            error={errors.name?.message}
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
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Telefone*"
            icon={Phone}
            error={errors.phone?.message}
            value={value}
            onChangeText={(text) => onChange(formatPhoneInput(text))}
            onBlur={onBlur}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            returnKeyType="next"
            maxLength={16}
          />
        )}
      />

      <Controller
        control={control}
        name="birth_date"
        render={({ field: { onChange, onBlur, value } }) => (
          <DateField
            label="Data de nascimento*"
            error={errors.birth_date?.message}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />

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
            <UserPlus size={18} color={colors.onPrimary} />
          )}
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isSubmitting || isPending
              ? "Salvando..."
              : isEditMode
                ? "Salvar alterações"
                : "Cadastrar cliente"}
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
