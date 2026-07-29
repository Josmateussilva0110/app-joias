import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Trash2 } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type DeleteButtonProps = {
  label?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function DeleteButton({
  label = "Excluir",
  loadingLabel = "Excluindo...",
  isLoading = false,
  onPress,
  disabled = false,
  style,
}: DeleteButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
    >
      <Trash2 size={18} color={colors.error} />
      <Text style={styles.label}>{isLoading ? loadingLabel : label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      height: 52,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      backgroundColor: `${colors.error}10`,
      borderColor: `${colors.error}30`,
    },
    label: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.error,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
  });
