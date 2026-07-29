import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Gem } from "lucide-react-native";
import { AppShell } from "@/components/appShell";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/use-profile";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import { APP_NAME } from "@/features/welcome/constants/welcome-constants";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const displayName =
    profile?.username ??
    user?.email?.split("@")[0] ??
    "visitante";

  return (
    <AppShell
      title="Início"
      subtitle={APP_NAME}
      showSettings
    >
      <ScreenWrapper
        style={{
          paddingHorizontal: width < 380 ? 16 : 24,
          paddingTop: 24,
        }}
      >
        <View style={[styles.content, { maxWidth: width >= 768 ? 520 : 420 }]}>
          <View style={styles.heroCard}>
            <View style={styles.iconWrap}>
              <Gem size={28} color={colors.primary} strokeWidth={1.75} />
            </View>

            <Text style={styles.greeting}>Olá, {displayName}</Text>
            <Text style={styles.message}>
              Bem-vindo ao seu painel de vendas de joias.
            </Text>
          </View>

          <Text style={styles.hint}>
            Em breve você poderá registrar vendas, clientes e pagamentos por aqui.
          </Text>
        </View>
      </ScreenWrapper>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      width: "100%",
      alignSelf: "center",
      gap: 20,
    },
    heroCard: {
      borderWidth: 1,
      borderRadius: 22,
      padding: 24,
      alignItems: "center",
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
    },
    greeting: {
      marginTop: 16,
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    message: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: "center",
    },
    hint: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 8,
    },
  });
