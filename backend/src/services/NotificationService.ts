import {
  NotificationSettingsResponse,
  RegisterPushTokenDTO,
  UpdateNotificationSettingsDTO,
} from "@app/shared"
import { DateTime } from "luxon"
import { createSupabaseClientForUser, supabaseAdmin } from "../database/supabase/supabase"
import { NotificationErrorCode } from "../types/code/notificationCode"
import { ServiceResult } from "../types/serviceResults/ServiceResult"

type PushMessage = {
  to: string
  sound?: "default"
  title: string
  body: string
  data?: Record<string, unknown>
}

type PushTicket =
  | { status: "ok"; id?: string }
  | { status: "error"; message?: string; details?: { error?: string } }

// expo-server-sdk é ESM-only; require evita conflito com CommonJS do backend.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ExpoSdk = require("expo-server-sdk") as {
  Expo: {
    isExpoPushToken(token: string): boolean
    new (): {
      chunkPushNotifications(messages: PushMessage[]): PushMessage[][]
      sendPushNotificationsAsync(messages: PushMessage[]): Promise<PushTicket[]>
    }
  }
}

const expo = new ExpoSdk.Expo()

type CustomerBirthdayRow = {
  id: string
  name: string
  created_by: string
}

type NotificationSettingsRow = {
  user_id: string
  enabled: boolean
  notify_hour: number
  notify_minute: number
  timezone: string
}

class NotificationService {
  private isValidPushToken(token: string) {
    return ExpoSdk.Expo.isExpoPushToken(token)
  }

  async registerPushToken(
    accessToken: string,
    userId: string,
    dto: RegisterPushTokenDTO
  ): Promise<ServiceResult<{ id: string }, NotificationErrorCode>> {
    if (!this.isValidPushToken(dto.expo_push_token)) {
      return {
        status: false,
        error: {
          code: NotificationErrorCode.INVALID_PUSH_TOKEN,
          message: "Token push inválido.",
        },
      }
    }

    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("user_push_tokens")
      .upsert(
        {
          user_id: userId,
          expo_push_token: dto.expo_push_token,
        },
        { onConflict: "expo_push_token" }
      )
      .select("id")
      .single()

    if (error) {
      console.error("[NotificationService.registerPushToken]", error)
      return {
        status: false,
        error: {
          code: NotificationErrorCode.PUSH_TOKEN_REGISTER_FAILED,
          message: "Não foi possível registrar o token push.",
        },
      }
    }

    return {
      status: true,
      data: { id: data.id },
    }
  }

  async removePushToken(
    accessToken: string,
    expoPushToken: string
  ): Promise<ServiceResult<void, NotificationErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { error } = await supabase
      .from("user_push_tokens")
      .delete()
      .eq("expo_push_token", expoPushToken)

    if (error) {
      console.error("[NotificationService.removePushToken]", error)
      return {
        status: false,
        error: {
          code: NotificationErrorCode.PUSH_TOKEN_REMOVE_FAILED,
          message: "Não foi possível remover o token push.",
        },
      }
    }

    return { status: true, data: undefined }
  }

  async getSettings(
    accessToken: string,
    userId: string
  ): Promise<ServiceResult<NotificationSettingsResponse, NotificationErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("notification_settings")
      .select("enabled, notify_hour, notify_minute, timezone")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      console.error("[NotificationService.getSettings]", error)
      return {
        status: false,
        error: {
          code: NotificationErrorCode.SETTINGS_FETCH_FAILED,
          message: "Não foi possível carregar as configurações de notificação.",
        },
      }
    }

    if (!data) {
      return {
        status: true,
        data: {
          enabled: false,
          notify_hour: 9,
          notify_minute: 0,
          timezone: "America/Sao_Paulo",
        },
      }
    }

    return {
      status: true,
      data: {
        enabled: data.enabled,
        notify_hour: data.notify_hour,
        notify_minute: data.notify_minute,
        timezone: data.timezone,
      },
    }
  }

  async updateSettings(
    accessToken: string,
    userId: string,
    dto: UpdateNotificationSettingsDTO
  ): Promise<ServiceResult<NotificationSettingsResponse, NotificationErrorCode>> {
    const supabase = createSupabaseClientForUser(accessToken)

    const { data, error } = await supabase
      .from("notification_settings")
      .upsert(
        {
          user_id: userId,
          enabled: dto.enabled,
          notify_hour: dto.notify_hour,
          notify_minute: dto.notify_minute,
          timezone: dto.timezone,
        },
        { onConflict: "user_id" }
      )
      .select("enabled, notify_hour, notify_minute, timezone")
      .single()

    if (error) {
      console.error("[NotificationService.updateSettings]", error)
      return {
        status: false,
        error: {
          code: NotificationErrorCode.SETTINGS_UPDATE_FAILED,
          message: "Não foi possível salvar as configurações de notificação.",
        },
      }
    }

    return {
      status: true,
      data: {
        enabled: data.enabled,
        notify_hour: data.notify_hour,
        notify_minute: data.notify_minute,
        timezone: data.timezone,
      },
    }
  }

  async runBirthdayNotificationJob(now = new Date()) {
    const utcNow = DateTime.fromJSDate(now, { zone: "utc" })
    const hourUtc = utcNow.hour
    const minuteUtc = utcNow.minute
    const today = utcNow.toISODate()

    if (!today) {
      return { usersProcessed: 0, notificationsSent: 0 }
    }

    const { data: settingsRows, error: settingsError } = await supabaseAdmin
      .from("notification_settings")
      .select("user_id, enabled, notify_hour, notify_minute, timezone")
      .eq("enabled", true)
      .eq("notify_hour_utc", hourUtc)
      .eq("notify_minute_utc", minuteUtc)

    if (settingsError) {
      console.error("[BirthdayNotificationCron] settings query failed:", settingsError)
      return { usersProcessed: 0, notificationsSent: 0 }
    }

    let notificationsSent = 0

    for (const settings of (settingsRows ?? []) as NotificationSettingsRow[]) {
      const sentForUser = await this.sendBirthdayNotificationsForUser(settings.user_id, today)
      notificationsSent += sentForUser
    }

    return {
      usersProcessed: settingsRows?.length ?? 0,
      notificationsSent,
    }
  }

  async recalculateUtcOffsets() {
    const { data: rows, error } = await supabaseAdmin
      .from("notification_settings")
      .select("user_id, notify_hour, notify_minute, timezone, enabled")

    if (error) {
      console.error("[BirthdayNotificationCron] recalculate failed:", error)
      return { updated: 0 }
    }

    let updated = 0

    for (const row of rows ?? []) {
      const { error: updateError } = await supabaseAdmin
        .from("notification_settings")
        .update({
          notify_hour: row.notify_hour,
          notify_minute: row.notify_minute,
          timezone: row.timezone,
          enabled: row.enabled,
        })
        .eq("user_id", row.user_id)

      if (!updateError) {
        updated += 1
      }
    }

    return { updated }
  }

  private async sendBirthdayNotificationsForUser(userId: string, today: string) {
    const { data: customers, error: customersError } = await supabaseAdmin.rpc(
      "clients_with_birthday_today",
      {
        p_user_id: userId,
        p_today: today,
      }
    )

    if (customersError) {
      console.error(
        `[BirthdayNotificationCron] customers query failed for ${userId}:`,
        customersError
      )
      return 0
    }

    const birthdayCustomers = (customers ?? []) as CustomerBirthdayRow[]

    if (birthdayCustomers.length === 0) {
      return 0
    }

    const yearSent = DateTime.fromISO(today, { zone: "utc" }).year
    let sentCount = 0

    for (const customer of birthdayCustomers) {
      const alreadySent = await this.hasNotificationBeenSent(customer.id, yearSent)

      if (alreadySent) {
        continue
      }

      const tokens = await this.getPushTokensForUser(userId)

      if (tokens.length === 0) {
        continue
      }

      const messages: PushMessage[] = tokens.map((token) => ({
        to: token,
        sound: "default",
        title: "Aniversário hoje",
        body: `${customer.name} faz aniversário hoje. Aproveite para parabenizar!`,
        data: {
          customerId: customer.id,
          type: "customer-birthday",
        },
      }))

      const tickets = await this.sendPushMessages(messages)
      const delivered = tickets.some((ticket) => ticket.status === "ok")

      if (delivered) {
        await this.logNotificationSent(customer.id, yearSent)
        sentCount += 1
      }

      await this.removeInvalidTokens(tokens, tickets)
    }

    return sentCount
  }

  private async hasNotificationBeenSent(clientId: string, yearSent: number) {
    const { data, error } = await supabaseAdmin
      .from("birthday_notifications_log")
      .select("id")
      .eq("client_id", clientId)
      .eq("year_sent", yearSent)
      .maybeSingle()

    if (error) {
      console.error("[BirthdayNotificationCron] log check failed:", error)
      return true
    }

    return Boolean(data)
  }

  private async logNotificationSent(clientId: string, yearSent: number) {
    const { error } = await supabaseAdmin.from("birthday_notifications_log").insert({
      client_id: clientId,
      year_sent: yearSent,
    })

    if (error && error.code !== "23505") {
      console.error("[BirthdayNotificationCron] log insert failed:", error)
    }
  }

  private async getPushTokensForUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("user_push_tokens")
      .select("expo_push_token")
      .eq("user_id", userId)

    if (error) {
      console.error("[BirthdayNotificationCron] tokens query failed:", error)
      return [] as string[]
    }

    return (data ?? [])
      .map((row) => row.expo_push_token)
      .filter((token): token is string => typeof token === "string" && this.isValidPushToken(token))
  }

  private async sendPushMessages(messages: PushMessage[]) {
    const validMessages = messages.filter((message) => {
      const token = typeof message.to === "string" ? message.to : message.to?.[0]
      return typeof token === "string" && this.isValidPushToken(token)
    })

    if (validMessages.length === 0) {
      return []
    }

    const chunks = expo.chunkPushNotifications(validMessages)
    const tickets = []

    for (const chunk of chunks) {
      try {
        const chunkTickets = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...chunkTickets)
      } catch (error) {
        console.error("[BirthdayNotificationCron] push send failed:", error)
      }
    }

    return tickets
  }

  private async removeInvalidTokens(tokens: string[], tickets: PushTicket[]) {
    const invalidTokens = tokens.filter((_token, index) => {
      const ticket = tickets[index]
      return ticket?.status === "error" && ticket.details?.error === "DeviceNotRegistered"
    })

    if (invalidTokens.length === 0) {
      return
    }

    const { error } = await supabaseAdmin
      .from("user_push_tokens")
      .delete()
      .in("expo_push_token", invalidTokens)

    if (error) {
      console.error("[BirthdayNotificationCron] invalid token cleanup failed:", error)
    }
  }
}

export default new NotificationService()
