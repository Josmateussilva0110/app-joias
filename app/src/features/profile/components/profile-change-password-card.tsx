import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { FormField } from "@/components/ui/form-field";
import { useChangePassword } from "@/hooks/use-profile";
import {
  profileChangePasswordSchema,
  type ProfileChangePasswordFormData,
} from "@/schemas/auth.schema";

export function ProfileChangePasswordCard() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { show } = useToast();
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileChangePasswordFormData>({
    resolver: zodResolver(profileChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ProfileChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });

      reset();
      show("success", "Senha atualizada com sucesso!");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.";
      show("error", message);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <KeyRound size={20} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Alterar senha</Text>
          <Text style={styles.subtitle}>
            Informe a senha atual e escolha uma nova senha segura.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Senha atual*"
              icon={KeyRound}
              error={errors.currentPassword?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Nova senha*"
              icon={KeyRound}
              error={errors.newPassword?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              label="Confirmar nova senha*"
              icon={KeyRound}
              error={errors.confirmPassword?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
              returnKeyType="done"
            />
          )}
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <KeyRound size={18} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {isSubmitting ? "Salvando..." : "Atualizar senha"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 24,
      padding: 20,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    form: {
      marginTop: 20,
      gap: 16,
    },
    button: {
      height: 52,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });
