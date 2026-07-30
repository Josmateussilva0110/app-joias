import "react-native-gesture-handler";
import "react-native-reanimated";

import { Stack } from "expo-router";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/lib/query-client";
import { asyncStoragePersister, QUERY_CACHE_BUSTER } from "@/lib/query-persister";
import { ToastProvider } from "@/context/toast.context";
import { AuthProvider } from "@/context/auth.context";
import { ThemeProvider, useTheme } from "@/context/theme.context";

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24; // 24h

function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "ios_from_right",
        animationDuration: 250,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: PERSIST_MAX_AGE,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            if (query.queryKey[0] === "products") {
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
