import type { ReactNode } from "react";

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/theme.context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { MOTION } from "@/components/ui/motion";
import { AppHeaderActions } from "@/components/layout/app-header-actions";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightElement?: ReactNode;
  showBack?: boolean;
};

export function AppShell({
  title,
  subtitle,
  children,
  rightElement,
  showBack = false,
}: AppShellProps): React.JSX.Element {
  const { colors: theme } = useTheme();
  const router = useRouter();

  const headerRight = rightElement ?? <AppHeaderActions />;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: theme.shellBackground }]}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.shellBackground}
      />

      <LinearGradient
        colors={[theme.headerGradientStart, theme.headerGradientEnd]}
        style={styles.header}
      >
        <Animated.View entering={MOTION.header} style={styles.headerContent}>
          <View style={styles.headerLeftRow}>
            {showBack ? (
              <AnimatedPressable
                onPress={() => router.back()}
                style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowLeft size={18} color={theme.text} />
              </AnimatedPressable>
            ) : null}

            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          {headerRight ? (
            <View style={styles.headerRight}>{headerRight}</View>
          ) : null}
        </Animated.View>

        <View style={[styles.headerBorder, { backgroundColor: theme.headerBorder }]} />
      </LinearGradient>

      <Animated.View entering={MOTION.screen} style={styles.content}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 8 : 4,
    paddingBottom: 0,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 16,
  },

  headerLeft: {
    flex: 1,
  },

  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerRight: {
    marginLeft: 12,
    paddingTop: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    letterSpacing: 0.2,
  },

  headerBorder: {
    height: 1,
  },

  content: {
    flex: 1,
  },
});
