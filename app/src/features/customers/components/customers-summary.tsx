import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type CustomersSummaryProps = {
  count: number;
};

export function CustomersSummary({ count }: CustomersSummaryProps) {
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
      <View style={styles.content}>
        <Text style={styles.label}>Clientes cadastrados</Text>
        <Text style={styles.value}>{count}</Text>
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
    },
    content: {
      gap: 2,
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.summaryLabel,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    value: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.summaryValue,
      letterSpacing: -0.5,
    },
  });
