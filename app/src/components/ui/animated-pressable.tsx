import { type ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { PRESS_SPRING } from "@/components/ui/motion";

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = Omit<PressableProps, "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scale?: number;
};

export function AnimatedPressable({
  children,
  style,
  scale = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const pressed = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  return (
    <AnimatedPressableComponent
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        pressed.value = withSpring(scale, PRESS_SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(1, PRESS_SPRING);
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressableComponent>
  );
}
