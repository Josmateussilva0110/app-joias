import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, Gem } from "lucide-react-native";
import { ProductResponse } from "@app/shared";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  formatCurrency,
  formatProductDate,
  getPaymentStatusLabel,
  JEWELRY_TYPE_LABELS,
} from "../constants/product-labels";

type ProductListItemProps = {
  product: ProductResponse;
  onPress: (product: ProductResponse) => void;
};

export function ProductListItem({ product, onPress }: ProductListItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isPaid = product.payment_status;

  return (
    <TouchableOpacity
      onPress={() => onPress(product)}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <Gem size={18} color={colors.primary} strokeWidth={1.75} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.customerName} numberOfLines={1}>
            {product.customer_name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              isPaid ? styles.statusPaid : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPaid ? styles.statusTextPaid : styles.statusTextPending,
              ]}
            >
              {getPaymentStatusLabel(isPaid)}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {JEWELRY_TYPE_LABELS[product.jewelry_type]} ·{" "}
          {formatProductDate(product.created_at)}
        </Text>

        <Text style={styles.value}>{formatCurrency(product.value)}</Text>
      </View>

      <ChevronRight size={18} color={colors.textSecondary} />
    </TouchableOpacity>
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
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBorderDefault,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
    },
    content: {
      flex: 1,
      gap: 4,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    customerName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: colors.cardName,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusPaid: {
      backgroundColor: colors.primaryMuted,
    },
    statusPending: {
      backgroundColor: `${colors.danger}18`,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "700",
    },
    statusTextPaid: {
      color: colors.success,
    },
    statusTextPending: {
      color: colors.danger,
    },
    meta: {
      fontSize: 13,
      color: colors.cardPrice,
    },
    value: {
      marginTop: 2,
      fontSize: 17,
      fontWeight: "800",
      color: colors.summaryValue,
    },
  });
