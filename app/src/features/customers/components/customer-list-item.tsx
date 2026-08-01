import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CustomerResponse } from "@app/shared";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { useListLayout } from "@/hooks/use-list-layout";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  formatCustomerBirthDate,
  formatCustomerPhone,
} from "../constants/customer-labels";

type CustomerListItemProps = {
  customer: CustomerResponse;
  onPress: (customer: CustomerResponse) => void;
  isLast?: boolean;
};

export const CustomerListItem = memo(function CustomerListItem({
  customer,
  onPress,
  isLast = false,
}: CustomerListItemProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = useMemo(
    () => createStyles(colors, isLast, isCompact),
    [colors, isLast, isCompact]
  );
  const avatarSize = isCompact ? 32 : 34;

  return (
    <Pressable
      onPress={() => onPress(customer)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <AvatarInitials name={customer.name} size={avatarSize} />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {customer.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatCustomerPhone(customer.phone)} · Nasc.{" "}
          {formatCustomerBirthDate(customer.birth_date)}
        </Text>
      </View>
    </Pressable>
  );
});

const createStyles = (
  colors: ThemeColors,
  isLast: boolean,
  isCompact: boolean
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: isCompact ? 10 : 12,
      paddingVertical: isCompact ? 8 : 10,
      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: colors.backgroundSelected,
    },
    rowPressed: {
      opacity: 0.72,
    },
    content: {
      flex: 1,
      gap: isCompact ? 2 : 3,
      minWidth: 0,
    },
    name: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "700",
      color: colors.cardName,
    },
    meta: {
      fontSize: isCompact ? 12 : 13,
      color: colors.cardPrice,
    },
  });
