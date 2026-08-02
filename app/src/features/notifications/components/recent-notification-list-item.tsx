import { Pressable, StyleSheet, Text, View } from "react-native";
import { Cake, X } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { useListLayout } from "@/hooks/use-list-layout";
import { formatRecentNotificationTime } from "@/services/recent-notifications.service";
import type { RecentNotification } from "@/storage/recent-notifications.storage";

type RecentNotificationListItemProps = {
  item: RecentNotification;
  onPress: (item: RecentNotification) => void;
  onDismiss: (item: RecentNotification) => void;
  isLast?: boolean;
};

export function RecentNotificationListItem({
  item,
  onPress,
  onDismiss,
  isLast = false,
}: RecentNotificationListItemProps) {
  const { colors } = useTheme();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isCompact, isLast);
  const isBirthday = item.type === "customer-birthday";

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [styles.contentPressable, pressed && styles.pressed]}
      >
        <View style={[styles.iconWrap, isBirthday && styles.iconWrapBirthday]}>
          <Cake size={16} color={isBirthday ? colors.primary : colors.textSecondary} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.time}>{formatRecentNotificationTime(item.receivedAt)}</Text>
          </View>

          {item.body ? (
            <Text style={styles.body} numberOfLines={3}>
              {item.body}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={() => onDismiss(item)}
        hitSlop={8}
        style={({ pressed }) => [styles.dismissButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Limpar notificação"
      >
        <X size={16} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean, isLast: boolean) =>
  StyleSheet.create({
    row: {
      minHeight: isCompact ? 72 : 80,
      flexDirection: "row",
      alignItems: "stretch",
      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: colors.backgroundSelected,
    },
    contentPressable: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingLeft: isCompact ? 14 : 16,
      paddingVertical: isCompact ? 12 : 14,
      paddingRight: 8,
    },
    pressed: {
      opacity: 0.7,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.backgroundSelected,
      flexShrink: 0,
      marginTop: 2,
    },
    iconWrapBirthday: {
      backgroundColor: colors.primaryMuted,
      borderColor: `${colors.primary}40`,
    },
    content: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },
    title: {
      flex: 1,
      minWidth: 0,
      fontSize: isCompact ? 14 : 15,
      fontWeight: "700",
      color: colors.text,
    },
    time: {
      flexShrink: 0,
      fontSize: 11,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    body: {
      fontSize: isCompact ? 12 : 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    dismissButton: {
      width: 44,
      alignItems: "center",
      justifyContent: "center",
      paddingRight: isCompact ? 10 : 12,
    },
  });
