import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

const DELETE_GRADIENT = ["#EF4444", "#DC2626"] as const;
const DELETE_GRADIENT_END = "#B91C1C";

type DeleteConfirmModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmModal({
  visible,
  title = "Confirmar exclusão",
  message,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[...DELETE_GRADIENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <AlertTriangle size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.85}
              style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            >
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.85}
              style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={[...DELETE_GRADIENT, DELETE_GRADIENT_END]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmLabel}>
                  {isLoading ? "Excluindo..." : confirmLabel}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(10, 8, 7, 0.72)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    card: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 24,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorderDefault,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
      elevation: 12,
    },
    iconWrap: {
      alignSelf: "center",
      marginBottom: 18,
    },
    iconGradient: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      letterSpacing: -0.3,
    },
    message: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: "center",
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 24,
    },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    cancelLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    confirmButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      overflow: "hidden",
    },
    confirmGradient: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    confirmLabel: {
      fontSize: 15,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    buttonDisabled: {
      opacity: 0.7,
    },
  });
