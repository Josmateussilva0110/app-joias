import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Fingerprint } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  getBiometricLabel,
  isBiometricLoginReady,
} from "@/storage/biometric.storage";

export function BiometricLoginButton() {
  const router = useRouter();
  const { show } = useToast();
  const { loginWithBiometric } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("digital");

  const loadState = useCallback(async () => {
    const [ready, label] = await Promise.all([
      isBiometricLoginReady(),
      getBiometricLabel(),
    ]);

    setIsVisible(ready);
    setBiometricLabel(label);
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  useFocusEffect(
    useCallback(() => {
      void loadState();
    }, [loadState])
  );

  const handlePress = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithBiometric();

      if (!result.success) {
        show("error", result.message);
        await loadState();
        return;
      }

      show("success", result.message);
      router.replace("/(protected)/home");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isSubmitting}
      activeOpacity={0.85}
      style={[styles.button, isSubmitting && styles.buttonDisabled]}
    >
      <Fingerprint size={18} color={colors.primary} />
      <Text style={styles.label}>
        {isSubmitting ? "Entrando..." : `Entrar com ${biometricLabel}`}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    label: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primary,
    },
  });
