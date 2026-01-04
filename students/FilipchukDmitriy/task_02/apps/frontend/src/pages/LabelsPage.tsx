import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { labelsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { labelSchema, type LabelFormData } from '../lib/validation';
import type { Label } from '../types';
import {
  Button,
  Input,
  Modal,
  ConfirmModal,
  Spinner,
  EmptyState,
  ErrorState,
  useToast,
} from '../components/ui';

export function LabelsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLabels = async () => {
    setIsLoading(true);
    setError(null);
    const response = await labelsApi.list();
    if (response.status === 'ok' && response.data) {
      setLabels(response.data);
    } else {
      setError(response.error || 'Не удалось загрузить метки');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLabels();
  }, []);

  const handleDelete = async () => {
    if (!deletingLabel) return;
    setIsDeleting(true);
    const response = await labelsApi.delete(deletingLabel.id);
    if (response.status === 'ok') {
      setLabels((prev) => prev.filter((l) => l.id !== deletingLabel.id));
      showToast('Метка удалена', 'success');
    } else {
      showToast(response.error || 'Ошибка удаления', 'error');
    }
    setIsDeleting(false);
    setDeletingLabel(null);
  };

  const canEdit = (label: Label) => {
    if (isAdmin) return true;
    if (label.isSystem) return false;
    return label.ownerId === user?.id;
  };

  const canDelete = (label: Label) => canEdit(label);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadLabels} />;
  }

  const systemLabels = labels.filter((l) => l.isSystem);
  const userLabels = labels.filter((l) => !l.isSystem);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Метки</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать метку
        </Button>
      </div>

      {labels.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>}
          title="Нет меток"
          description="Создайте метки для организации заметок"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              Создать метку
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {systemLabels.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Системные метки ⭐
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {systemLabels.map((label) => (
                  <LabelCard
                    key={label.id}
                    label={label}
                    canEdit={canEdit(label)}
                    canDelete={canDelete(label)}
                    onEdit={() => setEditingLabel(label)}
                    onDelete={() => setDeletingLabel(label)}
                  />
                ))}
              </div>
            </div>
          )}

          {userLabels.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Мои метки
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userLabels.map((label) => (
                  <LabelCard
                    key={label.id}
                    label={label}
                    canEdit={canEdit(label)}
                    canDelete={canDelete(label)}
                    onEdit={() => setEditingLabel(label)}
                    onDelete={() => setDeletingLabel(label)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <LabelFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isAdmin={isAdmin}
        onSuccess={(label) => {
          setLabels((prev) => [...prev, label]);
          setIsCreateOpen(false);
          showToast('Метка создана', 'success');
        }}
      />

      {/* Edit Modal */}
      <LabelFormModal
        isOpen={!!editingLabel}
        onClose={() => setEditingLabel(null)}
        label={editingLabel}
        isAdmin={isAdmin}
        onSuccess={(updated) => {
          setLabels((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          setEditingLabel(null);
          showToast('Метка обновлена', 'success');
        }}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingLabel}
        onClose={() => setDeletingLabel(null)}
        onConfirm={handleDelete}
        title="Удалить метку?"
        message={`Вы уверены, что хотите удалить метку "${deletingLabel?.name}"?`}
        confirmText="Удалить"
        isLoading={isDeleting}
      />
    </div>
  );
}

interface LabelCardProps {
  label: Label;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function LabelCard({ label, canEdit, canDelete, onEdit, onDelete }: LabelCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: label.color || '#9ca3af' }}
        />
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {label.name}
            {label.isSystem && (
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                системная
              </span>
            )}
          </div>
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Редактировать"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Удалить"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface LabelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  label?: Label | null;
  isAdmin: boolean;
  onSuccess: (label: Label) => void;
}

function LabelFormModal({ isOpen, onClose, label, isAdmin, onSuccess }: LabelFormModalProps) {
  const { showToast } = useToast();
  const isEdit = !!label;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: {
      name: label?.name || '',
      color: label?.color || '#3b82f6',
      isSystem: label?.isSystem || false,
    },
  });

  const currentColor = watch('color');

  useEffect(() => {
    if (label) {
      reset({
        name: label.name,
        color: label.color || '#3b82f6',
        isSystem: label.isSystem,
      });
    } else {
      reset({ name: '', color: '#3b82f6', isSystem: false });
    }
  }, [label, reset]);

  const onSubmit = async (data: LabelFormData) => {
    const payload = {
      name: data.name,
      color: data.color || null,
      ...(isAdmin ? { isSystem: data.isSystem } : {}),
    };

    const response = isEdit
      ? await labelsApi.update(label!.id, payload)
      : await labelsApi.create(payload);

    if (response.status === 'ok' && response.data) {
      onSuccess(response.data);
      reset();
    } else {
      showToast(response.error || 'Ошибка сохранения', 'error');
    }
  };

  const presetColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#000000',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Редактировать метку' : 'Новая метка'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Название"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Введите название метки"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цвет
          </label>
          <div className="flex gap-2 flex-wrap">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  currentColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setValue('color', color)}
              />
            ))}
            <input
              type="color"
              {...register('color')}
              className="w-8 h-8 rounded-full cursor-pointer"
            />
          </div>
        </div>

        {isAdmin && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isSystem')}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Системная метка (видна всем)</span>
          </label>
        )}

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
