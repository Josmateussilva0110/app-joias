import { z } from "zod";

export const RegisterPushTokenSchema = z.object({
  expo_push_token: z.string().min(1, "Token push é obrigatório"),
});

export const UpdateNotificationSettingsSchema = z.object({
  enabled: z.boolean(),
  notify_hour: z.coerce.number().int().min(0).max(23),
  notify_minute: z.coerce.number().int().min(0).max(59),
  timezone: z.string().min(1, "Timezone é obrigatório"),
});

export type RegisterPushTokenDTO = z.infer<typeof RegisterPushTokenSchema>;
export type UpdateNotificationSettingsDTO = z.infer<
  typeof UpdateNotificationSettingsSchema
>;

export type NotificationSettingsResponse = {
  enabled: boolean;
  notify_hour: number;
  notify_minute: number;
  timezone: string;
};
