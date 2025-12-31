import { prisma } from "../lib/prisma";

export async function ensureDefaultQueueAndSla() {
  const defaultQueueName = process.env.SEED_DEFAULT_QUEUE_NAME || "General";
  const reactionTimeMinutesRaw = process.env.SEED_DEFAULT_SLA_REACTION_MINUTES;
  const resolutionTimeMinutesRaw = process.env.SEED_DEFAULT_SLA_RESOLUTION_MINUTES;

  const reactionTimeMinutes = reactionTimeMinutesRaw ? Number(reactionTimeMinutesRaw) : 30;
  const resolutionTimeMinutes = resolutionTimeMinutesRaw ? Number(resolutionTimeMinutesRaw) : 240;

  if (!Number.isFinite(reactionTimeMinutes) || reactionTimeMinutes <= 0) {
    console.warn("SEED_DEFAULT_SLA_REACTION_MINUTES is invalid; using 30");
  }
  if (!Number.isFinite(resolutionTimeMinutes) || resolutionTimeMinutes <= 0) {
    console.warn("SEED_DEFAULT_SLA_RESOLUTION_MINUTES is invalid; using 240");
  }

  const safeReaction = Number.isFinite(reactionTimeMinutes) && reactionTimeMinutes > 0 ? reactionTimeMinutes : 30;
  const safeResolution =
    Number.isFinite(resolutionTimeMinutes) && resolutionTimeMinutes > 0 ? resolutionTimeMinutes : 240;

  // Find existing queue by name (simple, human-friendly idempotency)
  let queue = await prisma.queue.findFirst({
    where: { name: defaultQueueName },
    include: { sla: true },
    orderBy: { createdAt: "asc" },
  });

  if (!queue) {
    queue = await prisma.queue.create({
      data: { name: defaultQueueName, description: "Default queue (auto-seeded)" },
      include: { sla: true },
    });
    console.log(`📥 Default queue created: ${queue.name}`);
  }

  if (!queue.sla) {
    await prisma.sLA.create({
      data: {
        queueId: queue.id,
        reactionTimeMinutes: safeReaction,
        resolutionTimeMinutes: safeResolution,
      },
    });
    console.log(
      `⏱️ Default SLA created for queue ${queue.name}: reaction=${safeReaction}m resolution=${safeResolution}m`
    );
  }
}
