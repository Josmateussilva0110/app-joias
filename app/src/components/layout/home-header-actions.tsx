import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Settings, Users } from "lucide-react-native";
import { useTheme } from "@/context/theme.context";

export function HomeHeaderActions() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push("/(protected)/customers")}
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: colors.backgroundElement }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Users size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(protected)/profile")}
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: colors.backgroundElement }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Settings size={18} color={colors.textSecondary} />
      </TouchableOpacity>
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
