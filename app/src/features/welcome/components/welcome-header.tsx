import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Gem } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "../constants/welcome-constants";

export function WelcomeHeader() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <LinearGradient
        colors={[colors.primary, "#9A7840"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoContainer}
      >
        <Gem size={38} color={colors.onPrimary} strokeWidth={1.75} />
      </LinearGradient>

      <Text style={styles.eyebrow}>BEM-VINDO À</Text>

      <Text style={styles.title}>
        <Text style={styles.titleHighlight}>{APP_NAME}</Text>
      </Text>

      <Text style={styles.subtitle}>
        Seu controle de vendas de joias em um só lugar — do balcão ao caixa,
        com elegância e praticidade.
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      alignItems: "center",
    },
    logoContainer: {
      width: 84,
      height: 84,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.45,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 12,
    },
    eyebrow: {
      marginTop: 28,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2.4,
      color: colors.accent,
    },
    title: {
      marginTop: 8,
      fontSize: 34,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.5,
      color: colors.text,
    },
    titleHighlight: {
      color: colors.primary,
    },
    subtitle: {
      marginTop: 14,
      fontSize: 15,
      textAlign: "center",
      lineHeight: 23,
      color: colors.textSecondary,
      paddingHorizontal: 8,
    },
  });
