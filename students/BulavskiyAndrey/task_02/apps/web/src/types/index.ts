export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface Announcement {
  id: string;
  groupId: string;
  authorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface File {
  id: string;
  groupId: string;
  uploaderId: string;
  name: string;
  description: string | null;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string | null;
  createdAt: string;
  uploader?: User;
}

export interface Event {
  id: string;
  groupId: string;
  creatorId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  location: string | null;
  type: "lecture" | "deadline" | "exam" | "meeting" | "other";
  createdAt: string;
  creator?: User;
}

export interface Poll {
  id: string;
  groupId: string;
  creatorId: string;
  question: string;
  isAnonymous: boolean;
  isMultipleChoice: boolean;
  expiresAt: string | null;
  createdAt: string;
  creator?: User;
  choices?: (Choice & { votes?: unknown[] })[];
}

export interface Choice {
  id: string;
  pollId: string;
  text: string;
  order: number;
}

export interface Chat {
  id: string;
  groupId: string;
  title: string;
  type: "group" | "private" | "topic";
  isReadOnly: boolean;
  createdById: string;
  createdAt: string;
  createdBy?: User;
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  content: string;
  attachments: unknown[];
  createdAt: string;
  editedAt: string | null;
  isDeleted: boolean;
  author?: User;
}

