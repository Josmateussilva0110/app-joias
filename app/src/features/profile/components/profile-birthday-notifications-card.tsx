import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Cake, Clock3 } from "lucide-react-native";
import { ToggleRow } from "@/components/ui/toggle.row";
import { useToast } from "@/context/toast.context";
import { useTheme, type ThemeColors } from "@/context/theme.context";
import {
  birthdayNotificationTimeToDate,
  dateToBirthdayNotificationTime,
  formatBirthdayNotificationTime,
  type BirthdayNotificationTime,
} from "@/features/notifications/utils/birthday-notification-time";
import { useListLayout } from "@/hooks/use-list-layout";
import {
  disableBirthdayNotifications,
  enableBirthdayNotifications,
  getBirthdayNotificationSettings,
  isBirthdayNotificationsSupported,
  updateBirthdayNotificationTime,
} from "@/services/push-notifications.service";

export function ProfileBirthdayNotificationsCard() {
  const { colors } = useTheme();
  const { show } = useToast();
  const { isCompact } = useListLayout();
  const styles = createStyles(colors, isCompact);

  const [isEnabled, setIsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState<BirthdayNotificationTime>({
    hour: 9,
    minute: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const loadState = useCallback(async () => {
    setIsLoading(true);

    try {
      const settings = await getBirthdayNotificationSettings();
      setIsEnabled(settings.enabled);
      setNotificationTime({
        hour: settings.hour,
        minute: settings.minute,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const handleToggle = async (nextValue: boolean) => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      if (nextValue) {
        const result = await enableBirthdayNotifications();

        if (!result.success) {
          show("error", result.message);
          return;
        }

        setIsEnabled(true);
        show("success", result.message);
        return;
      }

      const result = await disableBirthdayNotifications();

      if (!result.success) {
        show("error", result.message);
        return;
      }

      setIsEnabled(false);
      show("success", result.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeChange = async (event: DateTimePickerEvent, date?: Date) => {
    setIsTimePickerOpen(false);

    if (event.type !== "set" || !date || isUpdating) {
      return;
    }

    const nextTime = dateToBirthdayNotificationTime(date);

    if (
      nextTime.hour === notificationTime.hour &&
      nextTime.minute === notificationTime.minute
    ) {
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateBirthdayNotificationTime(
        nextTime.hour,
        nextTime.minute
      );

      if (!result.success) {
        show("error", result.message);
        return;
      }

      setNotificationTime(nextTime);
      show("success", result.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isBirthdayNotificationsSupported()) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const formattedTime = formatBirthdayNotificationTime(
    notificationTime.hour,
    notificationTime.minute
  );

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Cake size={16} color={colors.primary} />
        <Text style={styles.sectionTitle}>Notificações</Text>
      </View>

      <ToggleRow
        icon={Cake}
        label="Lembretes de aniversário"
        hint={
          isEnabled
            ? `Aviso às ${formattedTime} no dia do aniversário`
            : "Ative para ser lembrado dos aniversários"
        }
        value={isEnabled}
        onChange={handleToggle}
      />

      {isEnabled ? (
        <TouchableOpacity
          onPress={() => setIsTimePickerOpen(true)}
          activeOpacity={0.7}
          disabled={isUpdating}
          style={[
            styles.timeRow,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.timeLeft}>
            <Clock3 size={isCompact ? 18 : 20} color={colors.primary} style={styles.timeIcon} />
            <View style={styles.timeTextWrap}>
              <Text
                style={[styles.timeLabel, { color: colors.text }]}
                numberOfLines={2}
              >
                Horário do lembrete
              </Text>
              <Text
                style={[styles.timeHint, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                Toque para alterar
              </Text>
            </View>
          </View>

          <Text style={[styles.timeValue, { color: colors.primary }]}>
            {formattedTime}
          </Text>
        </TouchableOpacity>
      ) : null}

      {isTimePickerOpen ? (
        <DateTimePicker
          value={birthdayNotificationTimeToDate(
            notificationTime.hour,
            notificationTime.minute
          )}
          mode="time"
          is24Hour
          display="default"
          onChange={handleTimeChange}
        />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors, isCompact: boolean) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 24,
      padding: isCompact ? 16 : 20,
      backgroundColor: colors.backgroundElement,
      borderColor: colors.backgroundSelected,
      gap: 12,
      width: "100%",
      maxWidth: "100%",
      alignSelf: "stretch",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      fontSize: isCompact ? 15 : 16,
      fontWeight: "700",
      color: colors.text,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: isCompact ? 14 : 16,
      borderRadius: 14,
      borderWidth: 1,
      width: "100%",
      maxWidth: "100%",
    },
    timeLeft: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: isCompact ? 10 : 12,
    },
    timeIcon: {
      flexShrink: 0,
      marginTop: 1,
    },
    timeTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    timeLabel: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "600",
    },
    timeHint: {
      fontSize: isCompact ? 11 : 12,
      marginTop: 2,
      lineHeight: 16,
    },
    timeValue: {
      fontSize: isCompact ? 16 : 18,
      fontWeight: "700",
      flexShrink: 0,
    },
  });
