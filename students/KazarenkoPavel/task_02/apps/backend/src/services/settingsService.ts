import { prisma } from "../lib/prisma";
import { AuthUser } from "../types/jwt";
import { UpdateNotificationSettingsInput } from "../schemas/settingsSchemas";

export async function getNotificationSettings(user: AuthUser) {
  const settings = await prisma.notificationSettings.findUnique({ where: { userId: user.id } });
  if (settings) return settings;
  return prisma.notificationSettings.create({
    data: {
      userId: user.id
    }
  });
}

export async function updateNotificationSettings(user: AuthUser, input: UpdateNotificationSettingsInput) {
  const existing = await getNotificationSettings(user);
  const updated = await prisma.notificationSettings.update({
    where: { id: existing.id },
    data: {
      notifyPush: input.notifyPush ?? existing.notifyPush,
      notifyEmail: input.notifyEmail ?? existing.notifyEmail,
      notifySound: input.notifySound ?? existing.notifySound
    }
  });
  return updated;
}
