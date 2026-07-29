import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Gem } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

type Props = {
  subtitle: string;
};

export function AuthHeader({ subtitle }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <LinearGradient
        colors={[colors.primary, "#9A7840"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <Gem size={28} color={colors.onPrimary} strokeWidth={1.75} />
      </LinearGradient>

      <Text style={styles.eyebrow}>JOALHERIA</Text>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      alignItems: "center",
      marginBottom: 28,
    },
    iconWrap: {
      width: 68,
      height: 68,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    eyebrow: {
      marginTop: 18,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2.2,
      color: colors.accent,
    },
    title: {
      marginTop: 6,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: colors.primary,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      color: colors.textSecondary,
      paddingHorizontal: 12,
    },
  });
