import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Loader2 } from "lucide-react-native";
import { useEffect } from "react";

import { useTheme } from "@/context/theme.context";
import { MOTION } from "@/components/ui/motion";

type LoadingStateProps = {
  message?: string;
};

type SpinningLoaderProps = {
  color: string;
  size?: number;
};

function SpinningLoader({ color, size = 32 }: SpinningLoaderProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 900,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Loader2 size={size} color={color} strokeWidth={2.5} />
    </Animated.View>
  );
}

export function LoadingState({
  message = "Carregando…",
}: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={MOTION.screen} style={styles.container}>
      <SpinningLoader color={colors.primary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
});
