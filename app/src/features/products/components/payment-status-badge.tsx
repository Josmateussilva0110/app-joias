import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { CheckCircle2, CircleAlert } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { getPaymentStatusLabel } from "../constants/product-labels";

type PaymentStatusBadgeProps = {
  isPaid: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PaymentStatusBadge({ isPaid, style }: PaymentStatusBadgeProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const Icon = isPaid ? CheckCircle2 : CircleAlert;
  const iconColor = isPaid ? colors.success : colors.danger;

  return (
    <View
      style={[
        styles.card,
        isPaid ? styles.cardPaid : styles.cardPending,
        style,
      ]}
    >
      <View style={[styles.iconWrap, isPaid ? styles.iconWrapPaid : styles.iconWrapPending]}>
        <Icon size={22} color={iconColor} strokeWidth={2} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Status do pagamento</Text>
        <Text style={[styles.value, isPaid ? styles.valuePaid : styles.valuePending]}>
          {getPaymentStatusLabel(isPaid)}
        </Text>
        <Text style={styles.hint}>
          {isPaid ? "Valor recebido do cliente" : "Pagamento ainda pendente"}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
    },
    cardPaid: {
      backgroundColor: `${colors.success}12`,
      borderColor: `${colors.success}35`,
    },
    cardPending: {
      backgroundColor: `${colors.danger}10`,
      borderColor: `${colors.danger}35`,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapPaid: {
      backgroundColor: `${colors.success}20`,
    },
    iconWrapPending: {
      backgroundColor: `${colors.danger}18`,
    },
    content: {
      flex: 1,
      gap: 2,
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    value: {
      fontSize: 18,
      fontWeight: "800",
    },
    valuePaid: {
      color: colors.success,
    },
    valuePending: {
      color: colors.danger,
    },
    hint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
