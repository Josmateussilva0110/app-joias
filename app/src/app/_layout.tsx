import "react-native-gesture-handler";
import "react-native-reanimated";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/lib/query-client";
import { asyncStoragePersister, QUERY_CACHE_BUSTER } from "@/lib/query-persister";
import { ToastProvider } from "@/context/toast.context";
import { AuthProvider } from "@/context/auth.context";
import { ThemeProvider, useTheme } from "@/context/theme.context";
import {
  pushTransition,
  withBackground,
} from "@/constants/navigation-transitions";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash já oculta ou indisponível (ex.: web).
});

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24; // 24h

function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack screenOptions={withBackground(colors, pushTransition)} />
  );
}

const NON_PERSISTENT_QUERY_KEYS = new Set(["products", "customers", "profile"]);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: PERSIST_MAX_AGE,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const rootKey = query.queryKey[0];
            if (typeof rootKey === "string" && NON_PERSISTENT_QUERY_KEYS.has(rootKey)) {
              return false;
            }

            return query.state.status === "success";
          },
        },
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
