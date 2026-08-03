import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { KeyRound, LogOut } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormField } from "@/components/ui/form-field";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useToast } from "@/context/toast.context";
import { useAuth } from "@/hooks/useAuth";
import { useChangePassword } from "@/hooks/use-profile";
import {
  requiredChangePasswordSchema,
  type RequiredChangePasswordFormData,
} from "@/schemas/auth.schema";

export default function ChangePasswordRequiredScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { show } = useToast();
  const { logout } = useAuth();
  const changePassword = useChangePassword();
  const { width } = useWindowDimensions();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequiredChangePasswordFormData>({
    resolver: zodResolver(requiredChangePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RequiredChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });

      show("success", "Senha definida com sucesso!");
      router.replace("/(protected)/home");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a senha.";
      show("error", message);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.authGradientStart, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAwareScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: width < 380 ? 16 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={120}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <KeyRound size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Defina uma nova senha</Text>
            <Text style={styles.subtitle}>
              Sua senha foi redefinida pelo suporte. Crie uma senha pessoal para
              continuar usando o app.
            </Text>
          </View>

          <View style={[styles.card, { borderColor: colors.backgroundSelected }]}>
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
                <KeyRound size={18} color={colors.onPrimary} />
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                  {isSubmitting ? "Salvando..." : "Salvar nova senha"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <LogOut size={16} color={colors.textSecondary} />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    scroll: {
      flexGrow: 1,
      paddingTop: 48,
      paddingBottom: 48,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 28,
      gap: 12,
    },
    iconWrap: {
      width: 68,
      height: 68,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundElement,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 12,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
      borderRadius: 22,
      borderWidth: 1,
      padding: 24,
      gap: 20,
      backgroundColor: colors.backgroundElement,
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
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 8,
    },
    logoutText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
  });
