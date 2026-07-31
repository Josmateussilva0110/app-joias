import { StyleSheet, Text, View } from "react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { getPaymentValueColor } from "@/components/ui/payment-status-chip";
import { useListLayout } from "@/hooks/use-list-layout";

type ListSectionHeaderProps = {
  title: string;
  isPaid?: boolean;
  count?: number;
};

export function ListSectionHeader({ title, isPaid, count }: ListSectionHeaderProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const isPaymentSection = isPaid !== undefined;
  const tone = isPaymentSection ? getPaymentValueColor(isPaid) : colors.textSecondary;
  const styles = createStyles(colors, tone, isCompact, isPaymentSection);

  return (
    <View style={styles.wrap}>
      <View style={styles.accent} />
      <Text style={styles.title}>{title}</Text>
      {count !== undefined ? <Text style={styles.count}>{count}</Text> : null}
    </View>
  );
}

const createStyles = (
  colors: ThemeColors,
  tone: string,
  isCompact: boolean,
  isPaymentSection: boolean
) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: isCompact ? 6 : 8,
      paddingBottom: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isPaymentSection ? `${tone}35` : colors.backgroundSelected,
    },
    accent: {
      width: 3,
      height: isCompact ? 14 : 16,
      borderRadius: 999,
      backgroundColor: tone,
    },
    title: {
      flex: 1,
      fontSize: isCompact ? 10 : 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: tone,
    },
    count: {
      fontSize: isCompact ? 11 : 12,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
      color: tone,
    },
  });
