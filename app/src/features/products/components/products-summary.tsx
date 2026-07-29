import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { formatCurrency } from "../constants/product-labels";
import type { ProductSummary } from "../utils/filter-products";

type ProductsSummaryProps = {
  summary: ProductSummary;
};

export function ProductsSummary({ summary }: ProductsSummaryProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <LinearGradient
      colors={[
        colors.summaryGradientStart,
        colors.summaryGradientMid,
        colors.summaryGradientEnd,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.item}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(summary.total)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={[styles.item, styles.countItem]}>
        <Text style={styles.label}>Qtd.</Text>
        <Text style={styles.countValue}>{summary.count}</Text>
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardBorderDefault,
      paddingVertical: 14,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    item: {
      flex: 1,
      gap: 2,
    },
    countItem: {
      flex: 0,
      minWidth: 72,
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.summaryLabel,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    totalValue: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.summaryValue,
      letterSpacing: -0.5,
    },
    countValue: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.summaryValue,
      letterSpacing: -0.5,
    },
    divider: {
      width: 1,
      height: 36,
      marginHorizontal: 14,
      backgroundColor: colors.cardBorderDefault,
    },
  });
