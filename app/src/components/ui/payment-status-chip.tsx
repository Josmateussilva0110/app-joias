import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { CheckCircle2, CircleAlert } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { getPaymentStatusLabel } from "@/features/products/constants/product-labels";

export const PAYMENT_VALUE_COLORS = {
  paid: "#22A55B",
  unpaid: "#DC4444",
} as const;

type PaymentStatusChipProps = {
  isPaid: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PaymentStatusChip({
  isPaid,
  compact = false,
  style,
}: PaymentStatusChipProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, isPaid, compact);
  const Icon = isPaid ? CheckCircle2 : CircleAlert;
  const tone = isPaid ? PAYMENT_VALUE_COLORS.paid : PAYMENT_VALUE_COLORS.unpaid;

  return (
    <View style={[styles.chip, style]}>
      <Icon size={compact ? 12 : 14} color={tone} strokeWidth={2.25} />
      <Text style={styles.label}>{getPaymentStatusLabel(isPaid)}</Text>
    </View>
  );
}

export function getPaymentValueColor(isPaid: boolean) {
  return isPaid ? PAYMENT_VALUE_COLORS.paid : PAYMENT_VALUE_COLORS.unpaid;
}

const createStyles = (colors: ThemeColors, isPaid: boolean, compact: boolean) => {
  const tone = isPaid ? PAYMENT_VALUE_COLORS.paid : PAYMENT_VALUE_COLORS.unpaid;

  return StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 4 : 6,
      paddingHorizontal: compact ? 8 : 10,
      paddingVertical: compact ? 4 : 5,
      borderRadius: 999,
      backgroundColor: `${tone}18`,
      borderWidth: 1,
      borderColor: `${tone}40`,
    },
    label: {
      fontSize: compact ? 10 : 11,
      fontWeight: "700",
      color: tone,
      letterSpacing: 0.2,
    },
  });
};
