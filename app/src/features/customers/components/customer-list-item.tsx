import { StyleSheet, Text, View } from "react-native";
import { CustomerResponse } from "@app/shared";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
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

export function CustomerListItem({
  customer,
  onPress,
  isLast = false,
}: CustomerListItemProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isLast, isCompact);
  const avatarSize = isCompact ? 32 : 34;

  return (
    <AnimatedPressable onPress={() => onPress(customer)} style={styles.row}>
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
    </AnimatedPressable>
  );
}

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
