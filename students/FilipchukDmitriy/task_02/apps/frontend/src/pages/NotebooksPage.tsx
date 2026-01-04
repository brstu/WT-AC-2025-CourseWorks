import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notebooksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { notebookSchema, type NotebookFormData } from '../lib/validation';
import type { Notebook } from '../types';
import {
  Button,
  Input,
  Textarea,
  Modal,
  ConfirmModal,
  Spinner,
  EmptyState,
  ErrorState,
  useToast,
} from '../components/ui';

export function NotebooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [deletingNotebook, setDeletingNotebook] = useState<Notebook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadNotebooks = async () => {
    setIsLoading(true);
    setError(null);
    const response = await notebooksApi.list();
    if (response.status === 'ok' && response.data) {
      setNotebooks(response.data);
    } else {
      setError(response.error || 'Не удалось загрузить тетради');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotebooks();
  }, []);

  const handleDelete = async () => {
    if (!deletingNotebook) return;
    setIsDeleting(true);
    const response = await notebooksApi.delete(deletingNotebook.id);
    if (response.status === 'ok') {
      setNotebooks((prev) => prev.filter((n) => n.id !== deletingNotebook.id));
      showToast('Тетрадь удалена', 'success');
    } else {
      showToast(response.error || 'Ошибка удаления', 'error');
    }
    setIsDeleting(false);
    setDeletingNotebook(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadNotebooks} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Мои тетради</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать тетрадь
        </Button>
      </div>

      {notebooks.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>}
          title="Нет тетрадей"
          description="Создайте первую тетрадь для хранения заметок"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              Создать тетрадь
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              isOwner={notebook.ownerId === user?.id || user?.role === 'admin'}
              onClick={() => navigate(`/notebooks/${notebook.id}`)}
              onEdit={() => setEditingNotebook(notebook)}
              onDelete={() => setDeletingNotebook(notebook)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <NotebookFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(notebook) => {
          setNotebooks((prev) => [notebook, ...prev]);
          setIsCreateOpen(false);
          showToast('Тетрадь создана', 'success');
        }}
      />

      {/* Edit Modal */}
      <NotebookFormModal
        isOpen={!!editingNotebook}
        onClose={() => setEditingNotebook(null)}
        notebook={editingNotebook}
        onSuccess={(updated) => {
          setNotebooks((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
          setEditingNotebook(null);
          showToast('Тетрадь обновлена', 'success');
        }}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingNotebook}
        onClose={() => setDeletingNotebook(null)}
        onConfirm={handleDelete}
        title="Удалить тетрадь?"
        message={`Вы уверены, что хотите удалить тетрадь "${deletingNotebook?.title}"? Все заметки в ней будут удалены.`}
        confirmText="Удалить"
        isLoading={isDeleting}
      />
    </div>
  );
}

interface NotebookCardProps {
  notebook: Notebook;
  isOwner: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function NotebookCard({ notebook, isOwner, onClick, onEdit, onDelete }: NotebookCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-2xl">📓</div>
        {isOwner && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Редактировать"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Удалить"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{notebook.title}</h3>
      {notebook.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{notebook.description}</p>
      )}
      <p className="text-xs text-gray-400 mt-3">
        {new Date(notebook.updatedAt).toLocaleDateString('ru-RU')}
      </p>
    </div>
  );
}

interface NotebookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebook?: Notebook | null;
  onSuccess: (notebook: Notebook) => void;
}

function NotebookFormModal({ isOpen, onClose, notebook, onSuccess }: NotebookFormModalProps) {
  const { showToast } = useToast();
  const isEdit = !!notebook;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotebookFormData>({
    resolver: zodResolver(notebookSchema),
    defaultValues: {
      title: notebook?.title || '',
      description: notebook?.description || '',
    },
  });

  useEffect(() => {
    if (notebook) {
      reset({
        title: notebook.title,
        description: notebook.description || '',
      });
    } else {
      reset({ title: '', description: '' });
    }
  }, [notebook, reset]);

  const onSubmit = async (data: NotebookFormData) => {
    const response = isEdit
      ? await notebooksApi.update(notebook!.id, data)
      : await notebooksApi.create(data);

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
      title={isEdit ? 'Редактировать тетрадь' : 'Новая тетрадь'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Название"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Введите название тетради"
        />
        <Textarea
          label="Описание"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Введите описание (необязательно)"
          rows={3}
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
