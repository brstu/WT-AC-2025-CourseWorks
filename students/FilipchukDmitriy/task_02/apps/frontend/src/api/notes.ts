import { api } from './client';
import type { ApiResponse, Note, NoteWithLabels, NoteCreateInput, NoteUpdateInput, NoteHistory } from '../types';

interface NotesQuery {
  notebookId: string;
  labelId?: string;
  limit?: number;
  offset?: number;
}

export const notesApi = {
  list: (query: NotesQuery): Promise<ApiResponse<Note[]>> => {
    const params = new URLSearchParams();
    params.append('notebookId', query.notebookId);
    if (query.labelId) params.append('labelId', query.labelId);
    if (query.limit !== undefined) params.append('limit', String(query.limit));
    if (query.offset !== undefined) params.append('offset', String(query.offset));
    return api.get(`/notes?${params.toString()}`);
  },

  get: (id: string): Promise<ApiResponse<NoteWithLabels>> =>
    api.get(`/notes/${id}`),

  create: (data: NoteCreateInput): Promise<ApiResponse<Note>> =>
    api.post('/notes', data),

  update: (id: string, data: NoteUpdateInput): Promise<ApiResponse<Note>> =>
    api.put(`/notes/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/notes/${id}`),

  getHistory: (id: string): Promise<ApiResponse<NoteHistory[]>> =>
    api.get(`/notes/${id}/history`),

  restoreHistory: (noteId: string, historyId: string): Promise<ApiResponse<Note>> =>
    api.post(`/notes/${noteId}/history/${historyId}/restore`),
};
