import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Trash2, UserRound } from "lucide-react-native";
import { CustomerResponse } from "@app/shared";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  formatCustomerBirthDate,
  formatCustomerPhone,
} from "../constants/customer-labels";

type CustomerListItemProps = {
  customer: CustomerResponse;
  onDelete: (customer: CustomerResponse) => void;
  isDeleting?: boolean;
};

export function CustomerListItem({
  customer,
  onDelete,
  isDeleting = false,
}: CustomerListItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
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

      <TouchableOpacity
        onPress={() => onDelete(customer)}
        disabled={isDeleting}
        activeOpacity={0.75}
        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
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
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.error}12`,
    },
    deleteButtonDisabled: {
      opacity: 0.5,
    },
  });
