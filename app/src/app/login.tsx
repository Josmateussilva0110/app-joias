import { useWindowDimensions, View, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme.context";
import { MOTION } from "@/components/ui/motion";

import { AuthHeader } from "../features/auth/components/auth-header";
import { LoginForm } from "../features/auth/components/login-form";
import { BiometricLoginButton } from "../features/auth/components/biometric-login-button";
import { LoginFooter } from "../features/auth/components/login-footer";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.authGradientStart}
      />
      <LinearGradient
        colors={[colors.authGradientStart, colors.authGradientEnd, colors.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAwareScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: width < 380 ? 16 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={120}
          extraHeight={120}
          enableAutomaticScroll
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader subtitle="Entre para gerenciar suas vendas de joias" />

          <Animated.View
            entering={MOTION.cardUp}
            style={[
              styles.card,
              {
                maxWidth: isTablet ? 500 : 420,
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
                shadowColor: colors.primary,
              },
            ]}
          >
            <LoginForm />
            <BiometricLoginButton />
            <LoginFooter />
          </Animated.View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingTop: 32,
    paddingBottom: 80,
  },
  card: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    gap: 20,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
