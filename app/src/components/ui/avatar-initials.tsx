import { StyleSheet, Text, View } from "react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

type AvatarInitialsProps = {
  name: string;
  size?: number;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function AvatarInitials({ name, size = 36 }: AvatarInitialsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, size);

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{getInitials(name)}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors, size: number) =>
  StyleSheet.create({
    wrap: {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${colors.primary}40`,
    },
    text: {
      fontSize: size * 0.34,
      fontWeight: "700",
      color: colors.primary,
      letterSpacing: 0.4,
    },
  });
