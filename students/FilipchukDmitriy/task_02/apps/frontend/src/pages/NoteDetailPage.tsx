import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notesApi, labelsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { noteSchema, type NoteFormData } from '../lib/validation';
import type { NoteWithLabels, NoteHistory, Label } from '../types';
import {
  Button,
  Input,
  Textarea,
  Modal,
  ConfirmModal,
  Spinner,
  ErrorState,
  useToast,
} from '../components/ui';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [note, setNote] = useState<NoteWithLabels | null>(null);
  const [history, setHistory] = useState<NoteHistory[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [restoringHistoryId, setRestoringHistoryId] = useState<string | null>(null);
  const [isLabelsOpen, setIsLabelsOpen] = useState(false);

  const loadNote = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const [noteRes, labelsRes] = await Promise.all([
      notesApi.get(id),
      labelsApi.list(),
    ]);

    if (noteRes.status === 'ok' && noteRes.data) {
      setNote(noteRes.data);
    } else {
      setError(noteRes.error || 'Заметка не найдена');
    }

    if (labelsRes.status === 'ok' && labelsRes.data) {
      setLabels(labelsRes.data);
    }

    setIsLoading(false);
  };

  const loadHistory = async () => {
    if (!id) return;
    const response = await notesApi.getHistory(id);
    if (response.status === 'ok' && response.data) {
      setHistory(response.data);
    }
  };

  useEffect(() => {
    loadNote();
  }, [id]);

  const handleRestore = async (historyId: string) => {
    if (!id) return;
    setRestoringHistoryId(historyId);
    const response = await notesApi.restoreHistory(id, historyId);
    if (response.status === 'ok' && response.data) {
      setNote((prev) => (prev ? { ...prev, ...response.data! } : null));
      showToast('Версия восстановлена', 'success');
      await loadHistory();
    } else {
      showToast(response.error || 'Ошибка восстановления', 'error');
    }
    setRestoringHistoryId(null);
  };

  const handleUpdateLabels = async (labelIds: string[]) => {
    if (!id) return;
    const response = await notesApi.update(id, { labelIds });
    if (response.status === 'ok') {
      await loadNote();
      showToast('Метки обновлены', 'success');
      setIsLabelsOpen(false);
    } else {
      showToast(response.error || 'Ошибка', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !note) {
    return <ErrorState message={error || 'Заметка не найдена'} onRetry={() => navigate(-1)} />;
  }

  const noteLabels = note.labels.map((l) => l.label);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/notebooks" className="hover:text-blue-600">
          Тетради
        </Link>
        <span>/</span>
        <Link to={`/notebooks/${note.notebookId}`} className="hover:text-blue-600">
          Тетрадь
        </Link>
        <span>/</span>
        <span className="text-gray-900">{note.title}</span>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Обновлено: {new Date(note.updatedAt).toLocaleString('ru-RU')}
            </p>
            
            {/* Labels */}
            <div className="flex flex-wrap gap-2 mt-3">
              {noteLabels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: label.color ? `${label.color}20` : '#f3f4f6',
                    color: label.color || '#6b7280',
                  }}
                >
                  {label.isSystem && <span className="mr-1">⭐</span>}
                  {label.name}
                </span>
              ))}
              <button
                onClick={() => setIsLabelsOpen(true)}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                + Метки
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                loadHistory();
                setIsHistoryOpen(true);
              }}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              История
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Редактировать
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {note.content ? (
            <div className="prose max-w-none whitespace-pre-wrap">
              {note.content}
            </div>
          ) : (
            <p className="text-gray-400 italic">Заметка пуста</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditNoteModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        note={note}
        onSuccess={(updated) => {
          setNote((prev) => (prev ? { ...prev, ...updated } : null));
          setIsEditing(false);
          showToast('Заметка обновлена', 'success');
        }}
      />

      {/* History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="История изменений"
        size="lg"
      >
        {history.length === 0 ? (
          <p className="text-gray-500 py-4">История изменений пуста</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString('ru-RU')}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={restoringHistoryId === entry.id}
                    onClick={() => handleRestore(entry.id)}
                  >
                    Восстановить
                  </Button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4 bg-gray-50 p-2 rounded">
                  {entry.content || '(пусто)'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Labels Modal */}
      <LabelsModal
        isOpen={isLabelsOpen}
        onClose={() => setIsLabelsOpen(false)}
        labels={labels}
        selectedIds={noteLabels.map((l) => l.id)}
        onSave={handleUpdateLabels}
      />
    </div>
  );
}

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: NoteWithLabels;
  onSuccess: (note: NoteWithLabels) => void;
}

function EditNoteModal({ isOpen, onClose, note, onSuccess }: EditNoteModalProps) {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note.title,
      content: note.content || '',
    },
  });

  useEffect(() => {
    reset({
      title: note.title,
      content: note.content || '',
    });
  }, [note, reset]);

  const onSubmit = async (data: NoteFormData) => {
    const response = await notesApi.update(note.id, data);
    if (response.status === 'ok' && response.data) {
      onSuccess({ ...note, ...response.data });
    } else {
      showToast(response.error || 'Ошибка сохранения', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать заметку" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Название"
          {...register('title')}
          error={errors.title?.message}
        />
        <Textarea
          label="Содержимое"
          {...register('content')}
          error={errors.content?.message}
          rows={12}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface LabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: Label[];
  selectedIds: string[];
  onSave: (labelIds: string[]) => void;
}

function LabelsModal({ isOpen, onClose, labels, selectedIds, onSave }: LabelsModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelected(new Set(selectedIds));
  }, [selectedIds, isOpen]);

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(Array.from(selected));
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбрать метки">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {labels.map((label) => (
          <label
            key={label.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.has(label.id)}
              onChange={() => handleToggle(label.id)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-sm"
              style={{
                backgroundColor: label.color ? `${label.color}20` : '#f3f4f6',
                color: label.color || '#6b7280',
              }}
            >
              {label.isSystem && <span className="mr-1">⭐</span>}
              {label.name}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          Сохранить
        </Button>
      </div>
    </Modal>
  );
}
