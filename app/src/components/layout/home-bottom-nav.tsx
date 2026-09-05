import { useEffect, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useRouter, useSegments, type Href } from "expo-router";
import { BarChart3, Gem, Users, type LucideIcon } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme.context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useListLayout } from "@/hooks/use-list-layout";

type TabKey = "home" | "analytics" | "customers";

type TabConfig = {
  key: TabKey;
  icon: LucideIcon;
  label: string;
  href: Href;
};

const TABS: TabConfig[] = [
  { key: "home", icon: Gem, label: "Vendas", href: "/(protected)/home" },
  {
    key: "analytics",
    icon: BarChart3,
    label: "Análise",
    href: "/(protected)/analytics" as Href,
  },
  {
    key: "customers",
    icon: Users,
    label: "Clientes",
    href: "/(protected)/customers",
  },
];

const ICON_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

/** Espaço extra acima do FAB flutuante. */
export const BOTTOM_NAV_FAB_CLEARANCE = 68;

function useBottomNavMetrics(compact: boolean) {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 6 : 0);

    return {
      iconSize: compact ? 20 : 22,
      labelSize: compact ? 10 : 11,
      indicatorWidth: compact ? 18 : 22,
      barHeight: compact ? 56 : 62,
      paddingHorizontal: compact ? 16 : 24,
      bottomInset,
    };
  }, [compact, insets.bottom]);
}

type TabItemProps = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onPress: () => void;
  iconSize: number;
  labelSize: number;
  indicatorWidth: number;
};

function TabItem({
  icon: Icon,
  label,
  active,
  onPress,
  iconSize,
  labelSize,
  indicatorWidth,
}: TabItemProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(active ? 1.02 : 1);

  useEffect(() => {
    scale.value = withTiming(active ? 1.02 : 1, ICON_TIMING);
  }, [active, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={styles.tab}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Animated.View style={iconStyle}>
        <Icon
          size={iconSize}
          color={active ? colors.primary : colors.textSecondary}
          strokeWidth={active ? 2.1 : 1.75}
        />
      </Animated.View>

      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            fontSize: labelSize,
            color: active ? colors.primary : colors.textSecondary,
            fontWeight: active ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>

      {active ? (
        <View
          style={[
            styles.activeBar,
            {
              width: indicatorWidth,
              backgroundColor: colors.primary,
              marginLeft: -indicatorWidth / 2,
            },
          ]}
        />
      ) : null}
    </AnimatedPressable>
  );
}

function isMainTabScreen(segments: string[]): boolean {
  const leaf = segments.at(-1);
  if (leaf === "home" || leaf === "analytics") return true;
  if (segments.includes("customers")) {
    return leaf === "customers" || leaf === "index";
  }
  return false;
}

function resolveActiveTab(segments: string[]): TabKey {
  if (!isMainTabScreen(segments)) return "home";
  if (segments.includes("analytics")) return "analytics";
  if (segments.includes("customers")) return "customers";
  return "home";
}

export function HomeBottomNav({
  style,
  onLayoutHeight,
}: {
  style?: StyleProp<ViewStyle>;
  onLayoutHeight?: (height: number) => void;
}) {
  const router = useRouter();
  const segments = useSegments();
  const { colors, isDark } = useTheme();
  const { isCompact } = useListLayout();
  const { height: screenHeight } = useWindowDimensions();
  const compact = isCompact || screenHeight < 700;
  const metrics = useBottomNavMetrics(compact);
  const activeTab = resolveActiveTab(segments as string[]);

  const goTo = (href: Href) => {
    router.dismissTo(href);
  };

  return (
    <View
      onLayout={(event) => onLayoutHeight?.(event.nativeEvent.layout.height)}
      style={[
        styles.wrapper,
        bottomBarShadow(isDark),
        {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          paddingBottom: metrics.bottomInset,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            height: metrics.barHeight,
            paddingHorizontal: metrics.paddingHorizontal,
          },
        ]}
      >
        {TABS.map((tab) => (
          <TabItem
            key={tab.key}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.key}
            iconSize={metrics.iconSize}
            labelSize={metrics.labelSize}
            indicatorWidth={metrics.indicatorWidth}
            onPress={() => {
              if (activeTab !== tab.key) goTo(tab.href);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function bottomBarShadow(isDark: boolean) {
  return Platform.select({
    ios: {
      shadowColor: isDark ? "#000000" : "#1A1612",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDark ? 0.16 : 0.05,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {},
  });
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 3,
    paddingTop: 4,
  },
  label: {
    letterSpacing: 0.1,
  },
  activeBar: {
    position: "absolute",
    bottom: 4,
    left: "50%",
    height: 2.5,
    borderRadius: 999,
  },
});
