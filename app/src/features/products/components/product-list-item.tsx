import { StyleSheet, Text, View } from "react-native";
import { Gem } from "lucide-react-native";
import { ProductResponse } from "@app/shared";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useListLayout } from "@/hooks/use-list-layout";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { formatCurrency } from "../constants/product-labels";
import {
  formatProductDay,
  formatProductMonthShort,
} from "../utils/group-products-by-payment";

type ProductListItemProps = {
  product: ProductResponse;
  onPress: (product: ProductResponse) => void;
  isLast?: boolean;
};

export function ProductListItem({
  product,
  onPress,
  isLast = false,
}: ProductListItemProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isLast, isCompact);

  return (
    <AnimatedPressable onPress={() => onPress(product)} style={styles.row}>
      <View style={styles.dateCol}>
        <Text style={styles.day}>{formatProductDay(product.created_at)}</Text>
        <Text style={styles.month}>{formatProductMonthShort(product.created_at)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.customerName} numberOfLines={1}>
          {product.customer_name}
        </Text>
        <View style={styles.metaRow}>
          <Gem size={isCompact ? 11 : 12} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.meta} numberOfLines={1}>
            {product.jewelry_type}
          </Text>
        </View>
      </View>

      <Text
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {formatCurrency(product.value)}
      </Text>
    </AnimatedPressable>
  );
}

const createStyles = (
  colors: ThemeColors,
  isLast: boolean,
  isCompact: boolean
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: isCompact ? 8 : 10,
      paddingVertical: isCompact ? 8 : 10,
      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: colors.backgroundSelected,
    },
    dateCol: {
      width: isCompact ? 32 : 36,
      alignItems: "center",
    },
    day: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "800",
      color: colors.text,
      lineHeight: isCompact ? 16 : 17,
    },
    month: {
      fontSize: 9,
      fontWeight: "700",
      color: colors.textSecondary,
      letterSpacing: 0.3,
    },
    content: {
      flex: 1,
      gap: isCompact ? 2 : 3,
      minWidth: 0,
    },
    customerName: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "700",
      color: colors.cardName,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    meta: {
      flex: 1,
      fontSize: isCompact ? 12 : 13,
      color: colors.cardPrice,
    },
    value: {
      flexShrink: 0,
      maxWidth: isCompact ? 96 : 108,
      fontSize: isCompact ? 14 : 15,
      fontWeight: "800",
      color: colors.text,
      fontVariant: ["tabular-nums"],
      textAlign: "right",
    },
  });
