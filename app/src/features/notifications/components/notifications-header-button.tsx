import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/context/theme.context";
import { useRecentNotificationsBadgeCount } from "@/hooks/use-recent-notifications";

export function NotificationsHeaderButton() {
  const router = useRouter();
  const { colors } = useTheme();
  const { badgeCount } = useRecentNotificationsBadgeCount();

  return (
    <AnimatedPressable
      onPress={() => router.push("/(protected)/notifications")}
      style={[styles.button, { backgroundColor: colors.backgroundElement }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Ver notificações recentes"
    >
      <Bell size={18} color={colors.textSecondary} />

      {badgeCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeText, { color: colors.onPrimary }]}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </Text>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
});
