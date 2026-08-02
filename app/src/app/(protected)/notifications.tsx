import { useCallback, useMemo } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { AppShell } from "@/components/appShell";
import { ScreenWrapper } from "@/components/layout/screen-wrapper";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { RecentNotificationListItem } from "@/features/notifications/components/recent-notification-list-item";
import { useListLayout } from "@/hooks/use-list-layout";
import {
  useRecentNotifications,
  useRecentNotificationsActions,
} from "@/hooks/use-recent-notifications";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import type { RecentNotification } from "@/storage/recent-notifications.storage";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { horizontalPadding, isCompact } = useListLayout();
  const styles = useMemo(() => createStyles(colors, isCompact), [colors, isCompact]);
  const { refresh, dismissOne, dismissAll } = useRecentNotificationsActions();

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = useRecentNotifications();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const handlePressItem = useCallback(
    (item: RecentNotification) => {
      if (item.customerId) {
        router.push({
          pathname: "/(protected)/customers/[id]",
          params: { id: item.customerId },
        });
      }
    },
    [router]
  );

  const handleDismissItem = useCallback(
    async (item: RecentNotification) => {
      await dismissOne(item.id);
    },
    [dismissOne]
  );

  const handleDismissAll = useCallback(async () => {
    await dismissAll();
  }, [dismissAll]);

  if (isLoading) {
    return (
      <AppShell title="Notificações" subtitle="Recentes" showBack>
        <LoadingState message="Carregando notificações..." />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="Notificações" subtitle="Recentes" showBack>
        <ErrorState
          error={error?.message ?? "Não foi possível carregar as notificações."}
          onRetry={() => refresh()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Notificações" subtitle="Recentes" showBack>
      <ScreenWrapper style={{ paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}>
              <Bell size={18} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>
                {notifications.length > 0
                  ? `${notifications.length} notificaç${
                      notifications.length === 1 ? "ão recente" : "ões recentes"
                    }`
                  : "Nenhuma notificação recente"}
              </Text>
              <Text style={styles.summaryHint}>
                Toque no X para limpar uma notificação da lista.
              </Text>
            </View>
          </View>

          {notifications.length > 0 ? (
            <TouchableOpacity
              onPress={() => void handleDismissAll()}
              activeOpacity={0.7}
              style={[styles.clearAllButton, { borderColor: colors.backgroundSelected }]}
            >
              <Text style={[styles.clearAllText, { color: colors.primary }]}>
                Limpar tudo
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={28} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sem notificações recentes</Text>
            <Text style={styles.emptyDescription}>
              Quando um lembrete chegar, ele aparecerá aqui.
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {notifications.map((item, index) => (
              <RecentNotificationListItem
                key={item.id}
                item={item}
                onPress={handlePressItem}
                onDismiss={(notification) => void handleDismissItem(notification)}
                isLast={index === notifications.length - 1}
              />
            ))}
          </View>
        )}
      </ScreenWrapper>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    summaryRow: {
      gap: 12,
      marginBottom: 16,
    },
    summaryCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: isCompact ? 14 : 16,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    summaryIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryMuted,
      flexShrink: 0,
    },
    summaryContent: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    summaryTitle: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "700",
      color: colors.text,
    },
    summaryHint: {
      fontSize: isCompact ? 12 : 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    clearAllButton: {
      alignSelf: "flex-start",
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.backgroundElement,
    },
    clearAllText: {
      fontSize: 13,
      fontWeight: "700",
    },
    listCard: {
      borderWidth: 1,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 48,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
