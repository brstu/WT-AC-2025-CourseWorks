import { prisma } from "../lib/prisma";
import { AuthUser } from "../types/jwt";
import { HttpError } from "../utils/httpError";
import { ExportQueryInput } from "../schemas/reportSchemas";

function ensureUserScope(requester: AuthUser, targetUserId: string) {
  if (requester.role !== "admin" && requester.id !== targetUserId) {
    throw new HttpError(403, "Forbidden", "forbidden");
  }
}

function sessionMinutes(duration: number | null, start: Date, end: Date | null) {
  if (duration && duration > 0) return duration;
  if (end) {
    const diffMs = end.getTime() - start.getTime();
    return Math.max(Math.round(diffMs / 60000), 0);
  }
  return 0;
}

async function getSessionsInRange(
  user: AuthUser,
  from: Date,
  to: Date,
  userId?: string,
  statuses?: Array<"running" | "paused" | "completed" | "interrupted">
) {
  const targetUserId = userId ?? user.id;
  ensureUserScope(user, targetUserId);

  return prisma.session.findMany({
    where: {
      userId: targetUserId,
      ...(statuses ? { status: { in: statuses } } : {}),
      startTime: {
        gte: from,
        lte: to
      }
    },
    include: {
      task: {
        include: {
          tags: {
            include: { tag: true }
          }
        }
      }
    },
    orderBy: { startTime: "asc" }
  });
}

export async function dailyReport(user: AuthUser, date: Date, userId?: string) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const sessions = await getSessionsInRange(user, start, end, userId, ["completed"]);

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + sessionMinutes(s.duration, s.startTime, s.endTime),
    0
  );

  const byType = { pomodoro: 0, short_break: 0, long_break: 0 };
  const byTag: Record<string, number> = {};
  for (const s of sessions) {
    const minutes = sessionMinutes(s.duration, s.startTime, s.endTime);
    byType[s.sessionType] = (byType[s.sessionType] || 0) + 1;
    
    if (!s.task) continue;
    for (const tt of s.task.tags) {
      byTag[tt.tag.name] = (byTag[tt.tag.name] || 0) + minutes;
    }
  }

  const completedTasks = await prisma.task.count({
    where: {
      userId: userId ?? user.id,
      status: "completed",
      updatedAt: { gte: start, lt: end }
    }
  });

  return { date: start.toISOString(), totalSessions, completedSessions: totalSessions, totalMinutes, byType, byTag, completedTasks };
}

export async function weeklyReport(user: AuthUser, weekStart: Date, userId?: string) {
  const start = weekStart;
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sessions = await getSessionsInRange(user, start, end, userId, ["completed"]);
  
  // Группируем по дням
  const dayReports: any[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const daySessions = sessions.filter(s => s.startTime >= dayStart && s.startTime < dayEnd);
    
    const byType = { pomodoro: 0, short_break: 0, long_break: 0 };
    for (const s of daySessions) {
      byType[s.sessionType] = (byType[s.sessionType] || 0) + 1;
    }
    
    dayReports.push({
      date: dayStart.toISOString(),
      totalSessions: daySessions.length,
      completedSessions: daySessions.length,
      totalMinutes: daySessions.reduce(
        (acc, s) => acc + sessionMinutes(s.duration, s.startTime, s.endTime),
        0
      ),
      byType
    });
  }
  
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + sessionMinutes(s.duration, s.startTime, s.endTime),
    0
  );
  
  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    days: dayReports,
    totals: {
      totalSessions,
      completedSessions: totalSessions,
      totalMinutes
    }
  };
}

export async function monthlyReport(user: AuthUser, month: string, userId?: string) {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  const start = new Date(Date.UTC(year, monthIdx, 1));
  const end = new Date(Date.UTC(year, monthIdx + 1, 1));
  const sessions = await getSessionsInRange(user, start, end, userId, ["completed"]);
  
  // Группируем по неделям
  const byWeek: { week: number; totalMinutes: number; completedSessions: number }[] = [];
  const weeksInMonth = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  for (let weekNum = 0; weekNum < weeksInMonth; weekNum++) {
    const weekStart = new Date(start.getTime() + weekNum * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(Math.min(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000, end.getTime()));
    const weekSessions = sessions.filter(s => s.startTime >= weekStart && s.startTime < weekEnd);
    
    byWeek.push({
      week: weekNum + 1,
      totalMinutes: weekSessions.reduce(
        (acc, s) => acc + sessionMinutes(s.duration, s.startTime, s.endTime),
        0
      ),
      completedSessions: weekSessions.length
    });
  }
  
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + sessionMinutes(s.duration, s.startTime, s.endTime),
    0
  );
  
  return {
    month,
    totalSessions,
    completedSessions: totalSessions,
    totalMinutes,
    byWeek
  };
}

export async function byTagReport(user: AuthUser, from: Date, to: Date, userId?: string) {
  const sessions = await getSessionsInRange(user, from, to, userId, ["completed"]);
  
  // Подсчет по тегам с дополнительной информацией
  const tagStats: Record<string, { minutes: number; sessions: number; color?: string; id: string }> = {};
  
  for (const s of sessions) {
    const minutes = sessionMinutes(s.duration, s.startTime, s.endTime);
    if (!s.task) continue;
    
    for (const tt of s.task.tags) {
      const tagName = tt.tag.name;
      if (!tagStats[tagName]) {
        tagStats[tagName] = {
          id: tt.tag.id,
          minutes: 0,
          sessions: 0,
          color: tt.tag.color || undefined
        };
      }
      tagStats[tagName].minutes += minutes;
      tagStats[tagName].sessions += 1;
    }
  }
  
  // Преобразуем в массив
  return Object.entries(tagStats).map(([name, stats]) => ({
    tagId: stats.id,
    tagName: name,
    tagColor: stats.color,
    totalSessions: stats.sessions,
    totalMinutes: stats.minutes
  }));
}

export async function exportReport(user: AuthUser, query: ExportQueryInput) {
  const from = new Date(query.from);
  const to = new Date(query.to);
  // Экспорт должен отдавать историю за период, включая прерванные сессии.
  const sessions = await getSessionsInRange(user, from, to, query.userId);

  const rows = sessions.map((s) => ({
    id: s.id,
    userId: s.userId,
    taskId: s.taskId,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime ? s.endTime.toISOString() : null,
    duration: sessionMinutes(s.duration, s.startTime, s.endTime),
    status: s.status,
    sessionType: s.sessionType
  }));

  if (query.format === "csv") {
    const header = "id,userId,taskId,startTime,endTime,duration,status,sessionType";
    const csv = [header, ...rows.map((r) =>
      [r.id, r.userId, r.taskId ?? "", r.startTime, r.endTime ?? "", r.duration, r.status, r.sessionType].join(",")
    )].join("\n");
    return { format: "csv" as const, content: csv };
  }

  return { format: "json" as const, content: rows };
}
