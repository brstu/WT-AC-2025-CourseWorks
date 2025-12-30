export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  userId: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string | null;
  userId: string;
  currentStageId: string | null;
  salary: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  stages?: Stage[];
  notes?: Note[];
  reminders?: Reminder[];
  jobId?: string; // For kanban drag-drop
}

export interface Stage {
  id: string;
  jobId: string;
  name: string;
  order: number;
  createdAt: string;
}

export interface Note {
  id: string;
  jobId: string;
  content: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  jobId: string;
  message: string;
  remindAt: string;
  createdAt: string;
  job?: {
    id: string;
    title: string;
  };
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface AuthData {
  accessToken: string;
  user: User;
}

export interface KanbanStage {
  id: string;
  name: string;
  jobs: Job[];
}
