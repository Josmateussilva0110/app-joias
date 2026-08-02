import {
  CUSTOMERS_MAX_PAGE_SIZE,
  CustomerListResult,
  CustomerResponse,
} from "@app/shared";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  BIRTHDAY_NOTIFICATION_CHANNEL_ID,
  BIRTHDAY_NOTIFICATION_IDENTIFIER_PREFIX,
} from "@/features/notifications/constants/birthday-notifications.constants";
import { parseBirthDateComponents } from "@/features/notifications/utils/birthday-date";
import { listCustomers } from "@/services/customer.service";
import {
  getBirthdayNotificationTime,
  isBirthdayNotificationsEnabled,
  setBirthdayNotificationsEnabled,
  setBirthdayNotificationTime,
  type BirthdayNotificationTime,
} from "@/storage/birthday-notifications.storage";

export function isBirthdayNotificationsSupported() {
  return Platform.OS === "android";
}

function isNotificationsModuleAvailable() {
  return typeof Notifications.scheduleNotificationAsync === "function";
}

function getNotificationsUnavailableMessage() {
  if (Constants.appOwnership === "expo") {
    return "Notificações locais exigem um build de desenvolvimento. O Expo Go não suporta este recurso.";
  }

  return "Notificações não estão disponíveis neste app. Gere um novo build Android com a versão mais recente.";
}

function assertNotificationsModuleAvailable() {
  if (!isNotificationsModuleAvailable()) {
    throw new Error(getNotificationsUnavailableMessage());
  }
}

function birthdayNotificationIdentifier(customerId: string) {
  return `${BIRTHDAY_NOTIFICATION_IDENTIFIER_PREFIX}${customerId.replace(/-/g, "")}`;
}

function buildNotificationContent(customer: CustomerResponse) {
  return {
    title: "Aniversário hoje",
    body: `${customer.name} faz aniversário hoje. Aproveite para parabenizar!`,
    data: {
      customerId: customer.id,
      type: "customer-birthday",
    },
  };
}

function computeNextBirthdayDate(
  birthDate: { month: number; day: number },
  time: BirthdayNotificationTime
) {
  const now = new Date();
  let next = new Date(
    now.getFullYear(),
    birthDate.month,
    birthDate.day,
    time.hour,
    time.minute,
    0,
    0
  );

  const minimumScheduleTime = Date.now() + 60_000;

  if (next.getTime() < minimumScheduleTime) {
    next = new Date(
      now.getFullYear() + 1,
      birthDate.month,
      birthDate.day,
      time.hour,
      time.minute,
      0,
      0
    );
  }

  return next;
}

async function cancelBirthdayNotificationForCustomer(customerId: string) {
  if (!isNotificationsModuleAvailable()) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(
      birthdayNotificationIdentifier(customerId)
    );
  } catch {
    // Ignora se o lembrete ainda não existia.
  }
}

export async function ensureBirthdayNotificationChannel() {
  if (!isBirthdayNotificationsSupported()) {
    return;
  }

  assertNotificationsModuleAvailable();

  await Notifications.setNotificationChannelAsync(BIRTHDAY_NOTIFICATION_CHANNEL_ID, {
    name: "Aniversários de clientes",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#B8954A",
  });
}

export async function requestBirthdayNotificationPermissions() {
  if (!isBirthdayNotificationsSupported()) {
    return { granted: false };
  }

  assertNotificationsModuleAvailable();
  await ensureBirthdayNotificationChannel();

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return { granted: true };
  }

  const requested = await Notifications.requestPermissionsAsync();
  return { granted: requested.granted };
}

async function cancelBirthdayNotifications() {
  if (!isBirthdayNotificationsSupported() || !isNotificationsModuleAvailable()) {
    return;
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    await Promise.all(
      scheduled
        .filter((notification) =>
          notification.identifier.startsWith(BIRTHDAY_NOTIFICATION_IDENTIFIER_PREFIX)
        )
        .map((notification) =>
          Notifications.cancelScheduledNotificationAsync(notification.identifier)
        )
    );
  } catch (error) {
    console.warn("[BirthdayNotifications] cancel failed:", error);
  }
}

async function scheduleBirthdayNotificationWithDateTrigger(
  customer: CustomerResponse,
  birthDate: { month: number; day: number },
  time: BirthdayNotificationTime
) {
  const identifier = birthdayNotificationIdentifier(customer.id);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: buildNotificationContent(customer),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: computeNextBirthdayDate(birthDate, time),
    },
  });
}

async function scheduleBirthdayNotificationWithYearlyTrigger(
  customer: CustomerResponse,
  birthDate: { month: number; day: number },
  time: BirthdayNotificationTime
) {
  const identifier = birthdayNotificationIdentifier(customer.id);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: buildNotificationContent(customer),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      channelId: BIRTHDAY_NOTIFICATION_CHANNEL_ID,
      month: birthDate.month,
      day: birthDate.day,
      hour: time.hour,
      minute: time.minute,
    },
  });
}

async function scheduleBirthdayNotification(
  customer: CustomerResponse,
  time: BirthdayNotificationTime
) {
  const birthDate = parseBirthDateComponents(customer.birth_date);

  if (!birthDate) {
    return { status: "skipped" as const };
  }

  await cancelBirthdayNotificationForCustomer(customer.id);

  try {
    await scheduleBirthdayNotificationWithDateTrigger(customer, birthDate, time);
    return { status: "scheduled" as const };
  } catch (dateError) {
    console.warn(
      `[BirthdayNotifications] date schedule failed for ${customer.id}:`,
      dateError
    );
  }

  try {
    await scheduleBirthdayNotificationWithYearlyTrigger(customer, birthDate, time);
    return { status: "scheduled" as const };
  } catch (yearlyError) {
    console.warn(
      `[BirthdayNotifications] yearly schedule failed for ${customer.id}:`,
      yearlyError
    );
    return { status: "failed" as const, error: yearlyError };
  }
}

function normalizeCustomerListResult(data: unknown): CustomerListResult | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  if (Array.isArray(data)) {
    const items = data as CustomerResponse[];
    return {
      items,
      page: 1,
      limit: items.length,
      total: items.length,
      has_more: false,
    };
  }

  const paginated = data as Partial<CustomerListResult>;

  if (!Array.isArray(paginated.items)) {
    return null;
  }

  return {
    items: paginated.items,
    page: paginated.page ?? 1,
    limit: paginated.limit ?? paginated.items.length,
    total: paginated.total ?? paginated.items.length,
    has_more: paginated.has_more ?? false,
  };
}

export async function fetchAllCustomersForBirthdayNotifications() {
  const customers: CustomerResponse[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await listCustomers({
      page,
      limit: CUSTOMERS_MAX_PAGE_SIZE,
    });

    if (!res.success) {
      throw new Error(res.message || "Não foi possível carregar os clientes.");
    }

    const normalized = normalizeCustomerListResult(res.data);

    if (!normalized) {
      throw new Error("Resposta de clientes inválida ao agendar lembretes.");
    }

    customers.push(...normalized.items);
    hasMore = normalized.has_more;
    page += 1;
  }

  return customers;
}

type SyncBirthdayNotificationsResult = {
  scheduled: number;
  skipped: number;
  failed: number;
};

export async function syncBirthdayNotifications(
  customers: CustomerResponse[]
): Promise<SyncBirthdayNotificationsResult> {
  if (!isBirthdayNotificationsSupported()) {
    return { scheduled: 0, skipped: 0, failed: 0 };
  }

  const enabled = await isBirthdayNotificationsEnabled();

  if (!enabled) {
    return { scheduled: 0, skipped: 0, failed: 0 };
  }

  assertNotificationsModuleAvailable();

  const permissions = await Notifications.getPermissionsAsync();

  if (!permissions.granted) {
    throw new Error("Permita notificações para receber lembretes de aniversário.");
  }

  await ensureBirthdayNotificationChannel();
  await cancelBirthdayNotifications();

  const time = await getBirthdayNotificationTime();
  const summary: SyncBirthdayNotificationsResult = {
    scheduled: 0,
    skipped: 0,
    failed: 0,
  };

  for (const customer of customers) {
    try {
      const result = await scheduleBirthdayNotification(customer, time);

      if (result.status === "scheduled") {
        summary.scheduled += 1;
      } else if (result.status === "skipped") {
        summary.skipped += 1;
      } else {
        summary.failed += 1;
      }
    } catch (error) {
      console.warn("[BirthdayNotifications] schedule failed:", error);
      summary.failed += 1;
    }
  }

  return summary;
}

export async function resyncBirthdayNotificationsIfEnabled() {
  if (!isBirthdayNotificationsSupported()) {
    return { scheduled: 0, skipped: 0, failed: 0 };
  }

  const enabled = await isBirthdayNotificationsEnabled();

  if (!enabled) {
    return { scheduled: 0, skipped: 0, failed: 0 };
  }

  const customers = await fetchAllCustomersForBirthdayNotifications();
  return syncBirthdayNotifications(customers);
}

function buildEnableMessage(result: SyncBirthdayNotificationsResult) {
  if (result.scheduled > 0 && result.failed > 0) {
    return `Lembretes ativados para ${result.scheduled} cliente(s). ${result.failed} não puderam ser agendados.`;
  }

  if (result.scheduled > 0) {
    return `Lembretes de aniversário ativados (${result.scheduled} cliente(s)).`;
  }

  if (result.failed > 0) {
    return `Não foi possível agendar ${result.failed} lembrete(s). Gere um novo APK com --clean-prebuild e verifique a permissão de alarmes exatos no Android.`;
  }

  return "Lembretes de aniversário ativados.";
}

function shouldFailEnable(result: SyncBirthdayNotificationsResult) {
  return result.scheduled === 0 && result.failed > 0;
}

export async function enableBirthdayNotifications() {
  if (!isBirthdayNotificationsSupported()) {
    return {
      success: false,
      message: "Lembretes de aniversário disponíveis apenas no Android.",
    };
  }

  if (!isNotificationsModuleAvailable()) {
    return {
      success: false,
      message: getNotificationsUnavailableMessage(),
    };
  }

  const permissions = await requestBirthdayNotificationPermissions();

  if (!permissions.granted) {
    return {
      success: false,
      message: "Permita notificações para receber lembretes de aniversário.",
    };
  }

  await setBirthdayNotificationsEnabled(true);

  try {
    const result = await resyncBirthdayNotificationsIfEnabled();

    if (shouldFailEnable(result)) {
      await setBirthdayNotificationsEnabled(false);
      return {
        success: false,
        message: buildEnableMessage(result),
      };
    }

    return {
      success: true,
      message: buildEnableMessage(result),
    };
  } catch (error) {
    await setBirthdayNotificationsEnabled(false);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível agendar os lembretes. Tente novamente.",
    };
  }
}

export async function updateBirthdayNotificationTime(hour: number, minute: number) {
  if (!isBirthdayNotificationsSupported()) {
    return {
      success: false,
      message: "Lembretes de aniversário disponíveis apenas no Android.",
    };
  }

  await setBirthdayNotificationTime({ hour, minute });

  try {
    const result = await resyncBirthdayNotificationsIfEnabled();

    if (shouldFailEnable(result)) {
      return {
        success: false,
        message: buildEnableMessage(result),
      };
    }

    return {
      success: true,
      message:
        result.failed > 0
          ? buildEnableMessage(result)
          : "Horário dos lembretes atualizado.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o horário dos lembretes.",
    };
  }
}

export async function getConfiguredBirthdayNotificationTime() {
  return getBirthdayNotificationTime();
}

export async function disableBirthdayNotifications() {
  if (!isBirthdayNotificationsSupported()) {
    return;
  }

  await cancelBirthdayNotifications();
  await setBirthdayNotificationsEnabled(false);
}

export async function clearBirthdayNotificationsOnLogout() {
  if (!isBirthdayNotificationsSupported()) {
    return;
  }

  await cancelBirthdayNotifications();
}
