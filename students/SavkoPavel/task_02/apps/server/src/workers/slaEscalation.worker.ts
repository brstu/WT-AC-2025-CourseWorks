import { prisma } from "../lib/prisma";

function priorityBump(priority: string) {
  // идемпотентно: low/medium -> high, дальше не трогаем
  if (priority === "low" || priority === "medium") return "high";
  return priority;
}

export function startSlaEscalationWorker() {
  const intervalSecondsRaw = process.env.SLA_CHECK_INTERVAL_SECONDS;
  const intervalSeconds = intervalSecondsRaw ? Number(intervalSecondsRaw) : 60;
  const intervalMs = Number.isFinite(intervalSeconds) && intervalSeconds > 0 ? intervalSeconds * 1000 : 60_000;

  async function tick() {
    const now = Date.now();

    const incidents = await prisma.incident.findMany({
      where: {
        NOT: { status: "resolved" },
      },
      select: {
        id: true,
        status: true,
        priority: true,
        createdAt: true,
        sla: {
          select: {
            reactionTimeMinutes: true,
            resolutionTimeMinutes: true,
          },
        },
      },
    });

    for (const incident of incidents) {
      const ageMinutes = (now - incident.createdAt.getTime()) / 60000;

      // SLA resolution breach -> escalated
      if (
        incident.status !== "resolved" &&
        incident.status !== "escalated" &&
        ageMinutes >= incident.sla.resolutionTimeMinutes
      ) {
        await prisma.incident.update({
          where: { id: incident.id },
          data: { status: "escalated", priority: "critical" },
        });
        continue;
      }

      // SLA reaction breach -> bump priority
      if (incident.status === "open" && ageMinutes >= incident.sla.reactionTimeMinutes) {
        const bumped = priorityBump(incident.priority);
        if (bumped !== incident.priority) {
          await prisma.incident.update({
            where: { id: incident.id },
            data: { priority: bumped as any },
          });
        }
      }
    }
  }

  // запускаем сразу, потом по интервалу
  tick().catch((e) => console.error("SLA worker tick failed", e));
  setInterval(() => {
    tick().catch((e) => console.error("SLA worker tick failed", e));
  }, intervalMs);

  console.log(`🕒 SLA escalation worker started (every ${Math.round(intervalMs / 1000)}s)`);
}
