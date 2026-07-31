import { StyleSheet, Text, View } from "react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { getPaymentStatusLabel } from "@/features/products/constants/product-labels";

type StatusIndicatorProps = {
  isPaid: boolean;
  showLabel?: boolean;
};

export function StatusIndicator({ isPaid, showLabel = true }: StatusIndicatorProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, isPaid);

  return (
    <View style={styles.wrap}>
      <View style={styles.dot} />
      {showLabel ? <Text style={styles.label}>{getPaymentStatusLabel(isPaid)}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isPaid: boolean) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: isPaid ? colors.success : colors.danger,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: isPaid ? colors.success : colors.danger,
    },
  });
