import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/theme.context";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) return null;
  if (!signed) return <Redirect href="/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="customers/index" options={{ headerShown: false }} />
      <Stack.Screen name="customers/new" options={{ headerShown: false }} />
      <Stack.Screen name="customers/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="customers/[id]/edit" options={{ headerShown: false }} />
      <Stack.Screen name="products/new" options={{ headerShown: false }} />
      <Stack.Screen name="products/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="products/[id]/edit" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}
