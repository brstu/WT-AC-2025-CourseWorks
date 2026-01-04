import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notebooksApi, notesApi, sharesApi, labelsApi, usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { noteSchema, type NoteFormData, shareSchema, type ShareFormData } from '../lib/validation';
import type { NotebookWithNotes, Note, Share, Label, UserFull, Permission } from '../types';
import {
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  ConfirmModal,
  Spinner,
  EmptyState,
  ErrorState,
  useToast,
} from '../components/ui';

export function NotebookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notebook, setNotebook] = useState<NotebookWithNotes | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [users, setUsers] = useState<UserFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [editingShare, setEditingShare] = useState<Share | null>(null);
  const [deletingShare, setDeletingShare] = useState<Share | null>(null);

  const isOwner = notebook?.ownerId === user?.id || user?.role === 'admin';
  const canWrite = isOwner; // Simplified - in real app check shares

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const [notebookRes, labelsRes] = await Promise.all([
      notebooksApi.get(id),
      labelsApi.list(),
    ]);

    if (notebookRes.status === 'ok' && notebookRes.data) {
      setNotebook(notebookRes.data);

      // Load shares if owner
      if (notebookRes.data.ownerId === user?.id || user?.role === 'admin') {
        const sharesRes = await sharesApi.list({ notebookId: id });
        if (sharesRes.status === 'ok' && sharesRes.data) {
          setShares(sharesRes.data);
        }
      }
    } else {
      setError(notebookRes.error || 'Тетрадь не найдена');
    }

    if (labelsRes.status === 'ok' && labelsRes.data) {
      setLabels(labelsRes.data);
    }

    // Load users for sharing (admin only or owner)
    if (user?.role === 'admin') {
      const usersRes = await usersApi.list();
      if (usersRes.status === 'ok' && usersRes.data) {
        setUsers(usersRes.data);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleDeleteNote = async () => {
    if (!deletingNote) return;
    setIsDeleting(true);
    const response = await notesApi.delete(deletingNote.id);
    if (response.status === 'ok') {
      setNotebook((prev) =>
        prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== deletingNote.id) } : null
      );
      showToast('Заметка удалена', 'success');
    } else {
      showToast(response.error || 'Ошибка удаления', 'error');
    }
    setIsDeleting(false);
    setDeletingNote(null);
  };

  const handleDeleteShare = async () => {
    if (!deletingShare) return;
    setIsDeleting(true);
    const response = await sharesApi.delete(deletingShare.id);
    if (response.status === 'ok') {
      setShares((prev) => prev.filter((s) => s.id !== deletingShare.id));
      showToast('Доступ отозван', 'success');
    } else {
      showToast(response.error || 'Ошибка', 'error');
    }
    setIsDeleting(false);
    setDeletingShare(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !notebook) {
    return <ErrorState message={error || 'Тетрадь не найдена'} onRetry={() => navigate('/notebooks')} />;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/notebooks" className="hover:text-blue-600">
          Тетради
        </Link>
        <span>/</span>
        <span className="text-gray-900">{notebook.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📓 {notebook.title}
            </h1>
            {notebook.description && (
              <p className="text-gray-600 mt-2">{notebook.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <Button variant="secondary" onClick={() => setIsShareOpen(true)}>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Доступ
              </Button>
            )}
            {canWrite && (
              <Button onClick={() => setIsCreateNoteOpen(true)}>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Новая заметка
              </Button>
            )}
          </div>
        </div>

        {/* Shares list */}
        {isOwner && shares.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Доступ открыт для:</h3>
            <div className="flex flex-wrap gap-2">
              {shares.map((share) => {
                const sharedUser = users.find((u) => u.id === share.userId);
                return (
                  <div
                    key={share.id}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm"
                  >
                    <span>{sharedUser?.username || share.userId.slice(0, 8)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      share.permission === 'write' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {share.permission === 'write' ? 'редактирование' : 'чтение'}
                    </span>
                    <button
                      onClick={() => setDeletingShare(share)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notes list */}
      {notebook.notes.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}
          title="Нет заметок"
          description="Создайте первую заметку в этой тетради"
          action={canWrite && (
            <Button onClick={() => setIsCreateNoteOpen(true)}>
              Создать заметку
            </Button>
          )}
        />
      ) : (
        <div className="space-y-3">
          {notebook.notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(note.updatedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                {isOwner && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/notes/${note.id}/edit`);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingNote(note as Note);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      <NoteFormModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        notebookId={notebook.id}
        labels={labels}
        onSuccess={(note) => {
          setNotebook((prev) =>
            prev ? { ...prev, notes: [{ id: note.id, title: note.title, updatedAt: note.updatedAt }, ...prev.notes] } : null
          );
          setIsCreateNoteOpen(false);
          showToast('Заметка создана', 'success');
        }}
      />

      {/* Delete Note Modal */}
      <ConfirmModal
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteNote}
        title="Удалить заметку?"
        message={`Вы уверены, что хотите удалить заметку "${deletingNote?.title}"?`}
        confirmText="Удалить"
        isLoading={isDeleting}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        notebookId={notebook.id}
        users={users.filter((u) => u.id !== notebook.ownerId)}
        existingShares={shares}
        onSuccess={(share) => {
          setShares((prev) => [...prev, share]);
          setIsShareOpen(false);
          showToast('Доступ предоставлен', 'success');
        }}
      />

      {/* Delete Share Modal */}
      <ConfirmModal
        isOpen={!!deletingShare}
        onClose={() => setDeletingShare(null)}
        onConfirm={handleDeleteShare}
        title="Отозвать доступ?"
        message="Пользователь больше не сможет просматривать эту тетрадь."
        confirmText="Отозвать"
        isLoading={isDeleting}
      />
    </div>
  );
}

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  labels: Label[];
  note?: Note | null;
  onSuccess: (note: Note) => void;
}

function NoteFormModal({ isOpen, onClose, notebookId, labels, note, onSuccess }: NoteFormModalProps) {
  const { showToast } = useToast();
  const isEdit = !!note;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  });

  useEffect(() => {
    if (note) {
      reset({ title: note.title, content: note.content || '' });
    } else {
      reset({ title: '', content: '' });
    }
  }, [note, reset]);

  const onSubmit = async (data: NoteFormData) => {
    const response = isEdit
      ? await notesApi.update(note!.id, data)
      : await notesApi.create({ ...data, notebookId });

    if (response.status === 'ok' && response.data) {
      onSuccess(response.data);
      reset();
    } else {
      showToast(response.error || 'Ошибка сохранения', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактировать заметку' : 'Новая заметка'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Название"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Введите название заметки"
        />
        <Textarea
          label="Содержимое"
          {...register('content')}
          error={errors.content?.message}
          placeholder="Введите текст заметки"
          rows={8}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  users: UserFull[];
  existingShares: Share[];
  onSuccess: (share: Share) => void;
}

function ShareModal({ isOpen, onClose, notebookId, users, existingShares, onSuccess }: ShareModalProps) {
  const { showToast } = useToast();

  const availableUsers = users.filter(
    (u) => !existingShares.some((s) => s.userId === u.id)
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
  });

  const onSubmit = async (data: ShareFormData) => {
    const response = await sharesApi.create({
      notebookId,
      userId: data.userId,
      permission: data.permission,
    });

    if (response.status === 'ok' && response.data) {
      onSuccess(response.data);
      reset();
    } else {
      showToast(response.error || 'Ошибка', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Поделиться тетрадью">
      {availableUsers.length === 0 ? (
        <p className="text-gray-500">Нет пользователей для добавления</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Пользователь"
            {...register('userId')}
            error={errors.userId?.message}
            placeholder="Выберите пользователя"
            options={availableUsers.map((u) => ({
              value: u.id,
              label: u.username,
            }))}
          />
          <Select
            label="Права доступа"
            {...register('permission')}
            error={errors.permission?.message}
            options={[
              { value: 'read', label: 'Только чтение' },
              { value: 'write', label: 'Редактирование' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Поделиться
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
