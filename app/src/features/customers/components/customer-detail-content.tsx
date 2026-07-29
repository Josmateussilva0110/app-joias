import { StyleSheet, Text, View } from "react-native";
import { CalendarClock, CalendarDays, Phone, UserRound } from "lucide-react-native";
import { CustomerResponse } from "@app/shared";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  formatCustomerBirthDate,
  formatCustomerCreatedAt,
  formatCustomerPhone,
} from "../constants/customer-labels";

type CustomerDetailContentProps = {
  customer: CustomerResponse;
};

type DetailRowProps = {
  icon: typeof UserRound;
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

export function CustomerDetailContent({ customer }: CustomerDetailContentProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <UserRound size={28} color={colors.primary} strokeWidth={1.75} />
        </View>
        <Text style={styles.heroName}>{customer.name}</Text>
      </View>

      <View style={styles.card}>
        <DetailRow
          icon={Phone}
          label="Telefone"
          value={formatCustomerPhone(customer.phone)}
          colors={colors}
        />
        <View style={styles.divider} />
        <DetailRow
          icon={CalendarDays}
          label="Data de nascimento"
          value={formatCustomerBirthDate(customer.birth_date)}
          colors={colors}
        />
        <View style={styles.divider} />
        <DetailRow
          icon={CalendarClock}
          label="Cadastrado em"
          value={formatCustomerCreatedAt(customer.created_at)}
          colors={colors}
        />
      </View>
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
      gap: 12,
      paddingVertical: 8,
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
    },
    heroName: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
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
    divider: {
      height: 1,
      backgroundColor: colors.backgroundSelected,
    },
  });
