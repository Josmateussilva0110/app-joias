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
import { User, Phone, UserPlus } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { DateField } from "@/components/ui/date-field";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useCreateCustomer } from "@/hooks/use-customers";
import {
  customerFormSchema,
  toCreateCustomerDTO,
  type CustomerFormData,
} from "@/schemas/customer.schema";

export function CustomerForm() {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const createCustomer = useCreateCustomer();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      birth_date: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomer.mutateAsync(toCreateCustomerDTO(data));
      show("success", "Cliente cadastrado com sucesso!");
      router.back();
    } catch (error) {
      show(
        "error",
        error instanceof Error ? error.message : "Não foi possível cadastrar o cliente."
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
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="11999998888"
            keyboardType="phone-pad"
            returnKeyType="next"
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
        disabled={isSubmitting || createCustomer.isPending}
        activeOpacity={0.85}
        style={(isSubmitting || createCustomer.isPending) && styles.buttonDisabled}
      >
        <LinearGradient
          colors={[colors.primary, "#9A7840"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <UserPlus size={18} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isSubmitting || createCustomer.isPending
              ? "Salvando..."
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
