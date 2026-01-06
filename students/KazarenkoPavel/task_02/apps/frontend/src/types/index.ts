// ============ Enums ============
export type Role = 'admin' | 'user';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type SessionStatus = 'running' | 'paused' | 'completed' | 'interrupted';
export type SessionType = 'pomodoro' | 'short_break' | 'long_break';

// ============ User ============
export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
}

// ============ Tag ============
export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

// ============ Task ============
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  // Backend возвращает плоский массив тегов для задачи
  tags: Array<Pick<Tag, 'id' | 'name' | 'color'>>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  tagIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  tagIds?: string[];
}

export interface TaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
  limit?: number;
  offset?: number;
}

// ============ Session ============
export interface Session {
  id: string;
  taskId?: string;
  task?: { id: string; title: string };
  startTime: string;
  endTime?: string;
  pausedAt?: string;
  totalPausedSeconds: number;
  duration?: number;
  status: SessionStatus;
  sessionType: SessionType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionInput {
  taskId?: string;
  sessionType: SessionType;
  duration?: number;
}

export interface UpdateSessionInput {
  status: 'completed' | 'interrupted';
  endTime?: string;
  duration?: number;
}

export interface SessionQuery {
  taskId?: string;
  status?: SessionStatus;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

// ============ Settings ============
export interface NotificationSettings {
  id: string;
  notifyPush: boolean;
  notifyEmail: boolean;
  notifySound: boolean;
}

export interface UpdateNotificationSettingsInput {
  notifyPush?: boolean;
  notifyEmail?: boolean;
  notifySound?: boolean;
}

// ============ Reports ============
export interface DailyReport {
  date: string;
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  byType: { pomodoro: number; short_break: number; long_break: number };
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  days: DailyReport[];
  totals: {
    totalSessions: number;
    completedSessions: number;
    totalMinutes: number;
  };
}

export interface MonthlyReport {
  month: string;
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  byWeek: { week: number; totalMinutes: number; completedSessions: number }[];
}

export interface TagReport {
  tagId: string;
  tagName: string;
  tagColor?: string;
  totalSessions: number;
  totalMinutes: number;
}

// ============ API Response ============
export interface ApiResponse<T> {
  status: 'ok' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
