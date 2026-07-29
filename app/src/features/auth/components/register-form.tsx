import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { UserPlus, Mail, Lock, User } from "lucide-react-native";

import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const { show } = useToast();
  const { register } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await register(data);

    if (!result.success) {
      show("error", result.message);
      return;
    }

    show("success", result.message);
    router.replace("/(protected)/home");
  };

  const onInvalid = () => {
    const firstError = Object.values(errors)[0]?.message;
    if (firstError) {
      show("error", firstError);
    }
  };

  return (
    <View style={styles.form}>
      {/* NOME */}
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Nome*"
            icon={User}
            error={errors.username?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Seu nome"
            autoCapitalize="words"
            returnKeyType="next"
          />
        )}
      />

      {/* EMAIL */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="E-mail*"
            icon={Mail}
            error={errors.email?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="SeuEmail@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        )}
      />

      {/* SENHA */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Senha*"
            icon={Lock}
            error={errors.password?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="••••••••"
            secureTextEntry
            returnKeyType="next"
          />
        )}
      />

      {/* CONFIRMAR SENHA */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Confirmar senha*"
            icon={Lock}
            error={errors.confirmPassword?.message}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="••••••••"
            secureTextEntry
            returnKeyType="done"
          />
        )}
      />

      {/* BOTÃO */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit, onInvalid)}
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
          <UserPlus size={18} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
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
