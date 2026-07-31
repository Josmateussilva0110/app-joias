import { StyleSheet, Text, View } from "react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useListLayout } from "@/hooks/use-list-layout";

export type KpiItem = {
  label: string;
  value: string;
  tone?: "default" | "danger";
};

type KpiGridProps = {
  items: KpiItem[];
};

export function KpiGrid({ items }: KpiGridProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isCompact);

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.label}>{item.label}</Text>
          <Text
            style={[
              styles.value,
              item.tone === "danger" && { color: colors.danger },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      gap: isCompact ? 6 : 8,
    },
    item: {
      flex: 1,
      gap: 1,
      paddingVertical: isCompact ? 7 : 8,
      paddingHorizontal: isCompact ? 8 : 10,
      borderRadius: 10,
      borderWidth: 1,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.cardBorderDefault,
      minWidth: 0,
    },
    label: {
      fontSize: 9,
      fontWeight: "700",
      color: colors.summaryLabel,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    value: {
      fontSize: isCompact ? 14 : 16,
      fontWeight: "800",
      color: colors.summaryValue,
      letterSpacing: -0.3,
      fontVariant: ["tabular-nums"],
    },
  });
