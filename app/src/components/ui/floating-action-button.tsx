import { type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";

import { premiumFabShadow } from "@/constants/elevation";
import { useTheme } from "@/context/theme.context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { MOTION } from "@/components/ui/motion";

type FloatingActionButtonProps = {
  onPress: () => void;
  icon: ReactNode;
  bottom: number;
};

export function FloatingActionButton({
  onPress,
  icon,
  bottom,
}: FloatingActionButtonProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={MOTION.fab}
      style={[styles.wrap, premiumFabShadow(isDark), { bottom }]}
    >
      <AnimatedPressable onPress={onPress} scale={0.92}>
        <LinearGradient
          colors={[colors.fabGradientStart, colors.fabGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {icon}
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 24,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
