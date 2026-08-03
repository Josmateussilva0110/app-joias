import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, SendHorizonal } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestFormData,
} from "@/schemas/auth.schema";
import { requestPasswordReset } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    const result = await requestPasswordReset(data);

    if (!result.success) {
      show("error", result.message);
      return;
    }

    show(
      "success",
      "Solicitação enviada. Nossa equipe vai entrar em contato para confirmar sua identidade e liberar o acesso."
    );
    router.replace("/login");
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="E-mail*"
            icon={Mail}
            error={errors.identifier?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="SeuEmail@email.com"
            returnKeyType="done"
          />
        )}
      />

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        activeOpacity={0.85}
        style={isSubmitting && styles.buttonDisabled}
      >
        <LinearGradient
          colors={[colors.primary, "#9A7840"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <SendHorizonal size={18} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isSubmitting ? "Enviando..." : "Enviar solicitação"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    form: {
      gap: 20,
    },
    button: {
      height: 52,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });
