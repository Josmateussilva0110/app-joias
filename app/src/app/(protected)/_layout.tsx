import { Redirect, Stack, useSegments, type Href } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/use-profile";
import { useTheme } from "@/context/theme.context";
import { PushTokenRegistration } from "@/features/notifications/components/push-token-registration";
import { NotificationInboxListener } from "@/features/notifications/components/notification-inbox-listener";
import {
  fadeTransition,
  modalTransition,
  pushTransition,
  tabTransition,
  withBackground,
} from "@/constants/navigation-transitions";

export default function ProtectedLayout() {
  const { signed, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const segments = useSegments();
  const { colors } = useTheme();

  if (loading || profileLoading) return null;
  if (!signed) return <Redirect href="/login" />;

  const onChangePasswordScreen = (segments as string[]).includes(
    "change-password-required"
  );

  if (profile?.must_change_password && !onChangePasswordScreen) {
    return (
      <Redirect href={"/(protected)/change-password-required" as Href} />
    );
  }

  const screen = (options: Parameters<typeof withBackground>[1]) =>
    withBackground(colors, options);

  return (
    <>
      <PushTokenRegistration />
      <NotificationInboxListener />
      <Stack screenOptions={screen(pushTransition)}>
      <Stack.Screen name="home" options={screen(tabTransition)} />
      <Stack.Screen name="customers/index" options={screen(tabTransition)} />
      <Stack.Screen name="customers/new" options={screen(modalTransition)} />
      <Stack.Screen name="customers/[id]" />
      <Stack.Screen name="customers/[id]/edit" options={screen(modalTransition)} />
      <Stack.Screen name="products/new" options={screen(modalTransition)} />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="products/[id]/edit" options={screen(modalTransition)} />
      <Stack.Screen name="analytics" options={screen(tabTransition)} />
      <Stack.Screen name="notifications" options={screen(fadeTransition)} />
      <Stack.Screen name="profile" />
      <Stack.Screen
        name="change-password-required"
        options={{ ...screen(pushTransition), headerShown: false, gestureEnabled: false }}
      />
    </Stack>
    </>
  );
}
