import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, UserRound } from "lucide-react-native";
import { CustomerResponse } from "@app/shared";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  formatCustomerBirthDate,
  formatCustomerPhone,
} from "../constants/customer-labels";

type CustomerListItemProps = {
  customer: CustomerResponse;
  onPress: (customer: CustomerResponse) => void;
};

export function CustomerListItem({ customer, onPress }: CustomerListItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      onPress={() => onPress(customer)}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <UserRound size={18} color={colors.primary} strokeWidth={1.75} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {customer.name}
        </Text>
        <Text style={styles.meta}>{formatCustomerPhone(customer.phone)}</Text>
        <Text style={styles.meta}>
          Nasc.: {formatCustomerBirthDate(customer.birth_date)}
        </Text>
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
    name: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.cardName,
    },
    meta: {
      fontSize: 13,
      color: colors.cardPrice,
    },
  });
