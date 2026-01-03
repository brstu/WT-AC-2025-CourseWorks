import { apiFetch } from './client';
import type { Company, Job, Stage, Note, Reminder, KanbanStage, User } from '../types';

// Users (admin only)
export const getUsers = () => apiFetch<{ users: User[] }>('/users');

export const deleteUser = (id: string) => apiFetch<void>(`/users/${id}`, { method: 'DELETE' });

// Companies
export const getCompanies = () => apiFetch<{ companies: Company[] }>('/companies');

export const getCompany = (id: string) => apiFetch<{ company: Company }>(`/companies/${id}`);

export const createCompany = (data: { name: string; website?: string }) =>
  apiFetch<{ company: Company }>('/companies', { method: 'POST', body: JSON.stringify(data) });

export const updateCompany = (id: string, data: Partial<{ name: string; website: string }>) =>
  apiFetch<{ company: Company }>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCompany = (id: string) =>
  apiFetch<void>(`/companies/${id}`, { method: 'DELETE' });

// Jobs
export const getJobs = () => apiFetch<{ jobs: Job[] }>('/jobs');

export const getJob = (id: string) => apiFetch<{ job: Job }>(`/jobs/${id}`);

export const createJob = (data: {
  title: string;
  companyId?: string;
  salary?: string;
  url?: string;
}) => apiFetch<{ job: Job }>('/jobs', { method: 'POST', body: JSON.stringify(data) });

export const updateJob = (
  id: string,
  data: Partial<{ title: string; companyId: string; salary: string; url: string }>,
) => apiFetch<{ job: Job }>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteJob = (id: string) => apiFetch<void>(`/jobs/${id}`, { method: 'DELETE' });

// Stages
export const getStages = (jobId: string) => apiFetch<{ stages: Stage[] }>(`/stages?jobId=${jobId}`);

export const createStage = (jobId: string, data: { name: string }) =>
  apiFetch<{ stage: Stage }>('/stages', {
    method: 'POST',
    body: JSON.stringify({ ...data, jobId, order: 0 }),
  });

export const updateStage = (id: string, data: Partial<{ name: string }>) =>
  apiFetch<{ stage: Stage }>(`/stages/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteStage = (id: string) => apiFetch<void>(`/stages/${id}`, { method: 'DELETE' });

// Notes
export const getNotes = (jobId: string) => apiFetch<{ notes: Note[] }>(`/notes?jobId=${jobId}`);

export const createNote = (jobId: string, data: { content: string }) =>
  apiFetch<{ note: Note }>('/notes', { method: 'POST', body: JSON.stringify({ ...data, jobId }) });

export const updateNote = (id: string, data: { content: string }) =>
  apiFetch<{ note: Note }>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteNote = (id: string) => apiFetch<void>(`/notes/${id}`, { method: 'DELETE' });

// Reminders
export const getReminders = (params: { jobId?: string }) => {
  const searchParams = new URLSearchParams();
  if (params.jobId) searchParams.set('jobId', params.jobId);
  const query = searchParams.toString();
  return apiFetch<{ reminders: Reminder[] }>(`/reminders${query ? `?${query}` : ''}`);
};

export const createReminder = (data: { jobId: string; message: string; remindAt: string }) =>
  apiFetch<{ reminder: Reminder }>('/reminders', { method: 'POST', body: JSON.stringify(data) });

export const updateReminder = (id: string, data: Partial<{ message: string; remindAt: string }>) =>
  apiFetch<{ reminder: Reminder }>(`/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteReminder = (id: string) =>
  apiFetch<void>(`/reminders/${id}`, { method: 'DELETE' });

// Kanban
export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  order: number;
  jobs: {
    id: string;
    title: string;
    companyId: string | null;
    companyName: string | null;
    salary: string | null;
    url: string | null;
    updatedAt: string;
  }[];
}

export const getKanban = () => apiFetch<{ columns: KanbanColumn[] }>('/kanban');

export const moveJobOnKanban = (jobId: string, status: string) =>
  apiFetch<{ job: any }>('/kanban/move', {
    method: 'PUT',
    body: JSON.stringify({ jobId, status }),
  });

export const getKanbanColumns = () =>
  apiFetch<{ columns: { id: string; name: string; color: string; order: number }[] }>(
    '/kanban/columns',
  );
