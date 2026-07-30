import { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Percent } from "lucide-react-native";

import { useTheme, type ThemeColors } from "@/context/theme.context";
import { formatCurrency } from "@/features/products/constants/product-labels";
import type { ProductAnalytics } from "@app/shared";
import { useAnalyticsEarningsPercent } from "@/hooks/use-analytics-earnings-percent";
import {
  calculateEarningsAmount,
  parseEarningsPercentInput,
} from "../utils/calculate-earnings";
import { useAnalyticsLayout } from "../utils/use-analytics-layout";

type AnalyticsEarningsCardProps = {
  summary: ProductAnalytics["summary"];
};

export function AnalyticsEarningsCard({ summary }: AnalyticsEarningsCardProps) {
  const { colors } = useTheme();
  const { isCompact } = useAnalyticsLayout();
  const { percent, setPercent, isLoaded, isSaving, isLoading } =
    useAnalyticsEarningsPercent();
  const [inputValue, setInputValue] = useState(String(percent));
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact]
  );

  useEffect(() => {
    if (isLoaded) {
      setInputValue(String(percent));
    }
  }, [isLoaded, percent]);

  const grossTotal = summary.total;
  const earningsTotal = calculateEarningsAmount(grossTotal, percent);
  const discountTotal = grossTotal - earningsTotal;

  const commitPercent = (rawValue: string) => {
    const parsed = parseEarningsPercentInput(rawValue);
    setPercent(parsed);
    setInputValue(String(parsed));
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>Sua parte</Text>
        <Text style={styles.subtitle}>
          Defina quanto você fica do total vendido
        </Text>
      </View>

      <View style={styles.percentRow}>
        <View style={styles.percentInputWrap}>
          <Percent size={16} color={colors.textSecondary} />
          <TextInput
            value={inputValue}
            onChangeText={(value) => {
              setInputValue(value.replace(/\D/g, "").slice(0, 3));
            }}
            onBlur={() => commitPercent(inputValue)}
            onSubmitEditing={() => commitPercent(inputValue)}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="40"
            placeholderTextColor={colors.textSecondary}
            style={styles.percentInput}
            returnKeyType="done"
            editable={isLoaded && !isSaving && !isLoading}
          />
          <Text style={styles.percentSuffix}>%</Text>
        </View>
        <Text style={styles.percentHint}>do total bruto</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Total bruto</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(grossTotal)}
          </Text>
        </View>

        <View style={styles.dividerVertical} />

        <View style={styles.item}>
          <Text style={styles.label}>Seu ganho ({percent}%)</Text>
          <Text
            style={[styles.value, styles.valueHighlight]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(earningsTotal)}
          </Text>
        </View>
      </View>

      {percent < 100 ? (
        <Text style={styles.discountHint}>
          Repasse de {formatCurrency(discountTotal)} ({100 - percent}%)
        </Text>
      ) : null}
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardBorderDefault,
      paddingVertical: isCompact ? 12 : 14,
      paddingHorizontal: isCompact ? 12 : 14,
      gap: isCompact ? 10 : 12,
    },
    header: {
      gap: 2,
    },
    title: {
      fontSize: isCompact ? 13 : 14,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      fontSize: isCompact ? 11 : 12,
      color: colors.textSecondary,
      lineHeight: isCompact ? 16 : 18,
    },
    percentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    percentInputWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: isCompact ? 40 : 44,
      minWidth: isCompact ? 108 : 116,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: colors.background,
      borderColor: colors.backgroundSelected,
    },
    percentInput: {
      flex: 1,
      fontSize: isCompact ? 16 : 18,
      fontWeight: "800",
      color: colors.text,
      paddingVertical: 0,
      textAlign: "right",
    },
    percentSuffix: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    percentHint: {
      flex: 1,
      fontSize: isCompact ? 11 : 12,
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.cardBorderDefault,
    },
    row: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    item: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    label: {
      fontSize: isCompact ? 9 : 10,
      fontWeight: "700",
      color: colors.summaryLabel,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    value: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "800",
      color: colors.summaryValue,
    },
    valueHighlight: {
      color: colors.primary,
    },
    dividerVertical: {
      width: 1,
      backgroundColor: colors.cardBorderDefault,
      marginHorizontal: isCompact ? 6 : 8,
    },
    discountHint: {
      fontSize: isCompact ? 10 : 11,
      color: colors.textSecondary,
    },
  });
