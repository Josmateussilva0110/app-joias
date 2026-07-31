import { StyleSheet, Text, View } from "react-native";
import { CalendarClock, Gem, UserRound } from "lucide-react-native";
import { ProductResponse } from "@app/shared";
import { premiumCardShadow } from "@/constants/elevation";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { StaggeredEntrance } from "@/components/ui/staggered-entrance";
import {
  formatCurrency,
  formatProductDate,
} from "../constants/product-labels";
import { PaymentStatusBadge } from "./payment-status-badge";

type ProductDetailContentProps = {
  product: ProductResponse;
};

type DetailRowProps = {
  icon: typeof Gem;
  label: string;
  value: string;
  colors: ThemeColors;
};

function DetailRow({ icon: Icon, label, value, colors }: DetailRowProps) {
  const styles = createRowStyles(colors);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon size={16} color={colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StaggeredEntrance variant="header" index={0}>
        <View style={[styles.hero, premiumCardShadow(colors.primary, isDark)]}>
          <View style={styles.heroIconWrap}>
            <Gem size={28} color={colors.primary} strokeWidth={1.75} />
          </View>
          <Text style={styles.heroValue}>{formatCurrency(product.value)}</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {product.jewelry_type}
          </Text>
          <Text style={styles.heroSubtitle} numberOfLines={1}>
            {product.customer_name}
          </Text>
        </View>
      </StaggeredEntrance>

      <StaggeredEntrance variant="header" index={1}>
        <PaymentStatusBadge isPaid={product.payment_status} />
      </StaggeredEntrance>

      <StaggeredEntrance variant="header" index={2}>
        <View style={[styles.card, premiumCardShadow(colors.primary, isDark)]}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <DetailRow
            icon={UserRound}
            label="Cliente"
            value={product.customer_name}
            colors={colors}
          />
          <View style={styles.divider} />
          <DetailRow
            icon={Gem}
            label="Joia"
            value={product.jewelry_type}
            colors={colors}
          />
          <View style={styles.divider} />
          <DetailRow
            icon={CalendarClock}
            label="Data da venda"
            value={formatProductDate(product.created_at)}
            colors={colors}
          />
        </View>
      </StaggeredEntrance>
    </View>
  );
}

const createRowStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryMuted,
    },
    content: {
      flex: 1,
      gap: 2,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    value: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
  });

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 24,
      gap: 20,
    },
    hero: {
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
    },
    heroIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      marginBottom: 4,
    },
    heroValue: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.summaryValue,
      letterSpacing: -0.5,
    },
    heroTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    heroSubtitle: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
      textAlign: "center",
    },
    card: {
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      gap: 16,
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBorderDefault,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.sectionTitleColor,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    divider: {
      height: 1,
      backgroundColor: colors.backgroundSelected,
    },
  });
