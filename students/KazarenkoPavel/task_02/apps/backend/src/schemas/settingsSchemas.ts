import { z } from "zod";

export const updateNotificationSettingsSchema = z.object({
  notifyPush: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  notifySound: z.boolean().optional()
});

export type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>;
