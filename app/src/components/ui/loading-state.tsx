import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Loader2 } from "lucide-react-native";

import { useTheme } from "@/context/theme.context";

type LoadingStateProps = {
  message?: string;
};

type SpinningLoaderProps = {
  color: string;
  size?: number;
};

function SpinningLoader({ color, size = 32 }: SpinningLoaderProps) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Loader2 size={size} color={color} strokeWidth={2.5} />
    </Animated.View>
  );
}

export function LoadingState({
  message = "Carregando…",
}: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <SpinningLoader color={colors.primary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
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
