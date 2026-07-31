import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/theme.context";
import {
  fadeTransition,
  modalTransition,
  pushTransition,
  withBackground,
} from "@/constants/navigation-transitions";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) return null;
  if (!signed) return <Redirect href="/login" />;

  const screen = (options: Parameters<typeof withBackground>[1]) =>
    withBackground(colors, options);

  return (
    <Stack screenOptions={screen(pushTransition)}>
      <Stack.Screen name="home" />
      <Stack.Screen name="customers/index" />
      <Stack.Screen name="customers/new" options={screen(modalTransition)} />
      <Stack.Screen name="customers/[id]" />
      <Stack.Screen name="customers/[id]/edit" options={screen(modalTransition)} />
      <Stack.Screen name="products/new" options={screen(modalTransition)} />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="products/[id]/edit" options={screen(modalTransition)} />
      <Stack.Screen name="analytics" options={screen(fadeTransition)} />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
