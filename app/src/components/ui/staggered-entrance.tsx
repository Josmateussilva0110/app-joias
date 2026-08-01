import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { type EntryExitAnimationFunction } from "react-native-reanimated";

import { MOTION } from "@/components/ui/motion";

type StaggeredEntranceProps = {
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "list" | "header";
  entering?: EntryExitAnimationFunction;
  /** Quando false, renderiza sem animação (ex.: paginação ou refresh). */
  enabled?: boolean;
};

export function StaggeredEntrance({
  index = 0,
  children,
  style,
  variant = "list",
  entering,
  enabled = true,
}: StaggeredEntranceProps) {
  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  const animation =
    entering ??
    (variant === "header" ? MOTION.listHeader(index) : MOTION.listItem(index));

  return (
    <Animated.View entering={animation} style={style}>
      {children}
    </Animated.View>
  );
}
