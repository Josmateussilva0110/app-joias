import { View, ScrollView, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme.context";
import { Spacing } from "@/constants/theme";
import { WelcomeHeader } from "../features/welcome/components/welcome-header";
import { WelcomeFeatures } from "../features/welcome/components/welcome-features";
import { WelcomeActions } from "../features/welcome/components/welcome-actions";

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.authGradientStart}
      />
      <LinearGradient
        colors={[colors.authGradientStart, colors.authGradientEnd, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <WelcomeHeader />
            <WelcomeFeatures />
            <WelcomeActions />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: Spacing.four,
    paddingBottom: 48,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
});
