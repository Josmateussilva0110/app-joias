import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { LogIn, UserPlus } from "lucide-react-native";
import { useTheme, type ThemeColors } from "@/context/theme.context";

export function WelcomeActions() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Link href="/login" asChild>
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primary, "#9A7840"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <LogIn size={20} color={colors.onPrimary} />
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              Entrar
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Link>

      <Link href="/register" asChild>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
          <UserPlus size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Criar conta</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: 32,
      gap: 12,
    },
    primaryButton: {
      paddingVertical: 16,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    primaryButtonText: {
      fontWeight: "700",
      fontSize: 16,
    },
    secondaryButton: {
      paddingVertical: 15,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.backgroundElement,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 16,
    },
  });
