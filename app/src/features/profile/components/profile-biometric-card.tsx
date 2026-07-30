import { ToggleRow } from "@/components/ui/toggle.row";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useAuth } from "@/hooks/useAuth";
import {
  getBiometricLabel,
  isBiometricHardwareAvailable,
  isBiometricLoginEnabled,
} from "@/storage/biometric.storage";
import { Fingerprint } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export function ProfileBiometricCard() {
  const { colors } = useTheme();
  const { show } = useToast();
  const { enableBiometricLogin, disableBiometricLogin } = useAuth();
  const styles = createStyles(colors);

  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("digital");

  const loadState = useCallback(async () => {
    setIsLoading(true);

    try {
      const [available, enabled, label] = await Promise.all([
        isBiometricHardwareAvailable(),
        isBiometricLoginEnabled(),
        getBiometricLabel(),
      ]);

      setIsAvailable(available);
      setIsEnabled(enabled);
      setBiometricLabel(label);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const handleToggle = async (nextValue: boolean) => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      if (nextValue) {
        const result = await enableBiometricLogin();

        if (!result.success) {
          if (result.message !== "Autenticação biométrica cancelada.") {
            show("error", result.message);
          }
          return;
        }

        setIsEnabled(true);
        show("success", result.message);
        return;
      }

      await disableBiometricLogin();
      setIsEnabled(false);
      show("success", "Login biométrico desativado.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isAvailable) {
    return (
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Fingerprint size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>Segurança</Text>
        </View>
        <Text style={styles.unavailableText}>
          Biometria não disponível neste dispositivo.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Fingerprint size={16} color={colors.primary} />
        <Text style={styles.sectionTitle}>Segurança</Text>
      </View>

      <ToggleRow
        icon={Fingerprint}
        label="Login com digital"
        hint={
          isEnabled
            ? `Entrar usando ${biometricLabel}`
            : `Ative para entrar com ${biometricLabel}`
        }
        value={isEnabled}
        onChange={handleToggle}
      />
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
      gap: 12,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    unavailableText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
  });
