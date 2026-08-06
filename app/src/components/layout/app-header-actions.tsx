import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { NotificationsHeaderButton } from "@/features/notifications/components/notifications-header-button";

export function AppHeaderActions() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <NotificationsHeaderButton />

      <AnimatedPressable
        onPress={() => router.push("/(protected)/profile")}
        style={[styles.button, { backgroundColor: colors.backgroundElement }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Configurações"
      >
        <Settings size={18} color={colors.textSecondary} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
