// ========== Enums ==========
export type Role = 'admin' | 'user';
export type Permission = 'read' | 'write';

// ========== Auth ==========
export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ========== Notebook ==========
export interface Notebook {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookWithNotes extends Notebook {
  notes: NoteSummary[];
}

export interface NotebookCreateInput {
  title: string;
  description?: string | null;
  ownerId?: string; // admin only
}

export interface NotebookUpdateInput {
  title?: string;
  description?: string | null;
}

// ========== Note ==========
export interface NoteSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  notebookId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteWithLabels extends Note {
  labels: { label: Label }[];
}

export interface NoteCreateInput {
  notebookId: string;
  title: string;
  content?: string | null;
  labelIds?: string[];
}

export interface NoteUpdateInput {
  title?: string;
  content?: string | null;
  labelIds?: string[];
}

// ========== Note History ==========
export interface NoteHistory {
  id: string;
  content: string;
  editedById: string | null;
  createdAt: string;
}

// ========== Label ==========
export interface Label {
  id: string;
  name: string;
  color: string | null;
  isSystem: boolean;
  ownerId: string | null;
}

export interface LabelCreateInput {
  name: string;
  color?: string | null;
  isSystem?: boolean; // admin only
}

export interface LabelUpdateInput {
  name?: string;
  color?: string | null;
  isSystem?: boolean; // admin only
}

// ========== Share ==========
export interface Share {
  id: string;
  notebookId: string;
  userId: string;
  permission: Permission;
  createdAt: string;
}

export interface ShareCreateInput {
  notebookId: string;
  userId: string;
  permission: Permission;
}

export interface ShareUpdateInput {
  permission: Permission;
}

// ========== User (admin) ==========
export interface UserFull {
  id: string;
  username: string;
  role: Role;
  createdAt?: string;
}

export interface UserCreateInput {
  username: string;
  password: string;
  role?: Role;
}

export interface UserUpdateInput {
  username?: string;
  password?: string;
  role?: Role;
}

// ========== API Response ==========
export interface ApiResponse<T> {
  status: 'ok' | 'error';
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ApiError {
  status: 'error';
  error: string;
  code: string;
  details?: Record<string, string[]>;
}
