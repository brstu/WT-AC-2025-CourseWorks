import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tagsApi, extractError } from '../api';
import { Tag, CreateTagInput, UpdateTagInput } from '../types';
import { LoadingSpinner, ErrorMessage, EmptyState, ConfirmDialog, useToast } from '../components';

const tagSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  color: z.string().optional(),
});

type TagFormData = z.infer<typeof tagSchema>;

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#78716c', '#71717a', '#6b7280',
];

export function TagsPage() {
  const { showToast } = useToast();
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      color: PRESET_COLORS[0],
    },
  });

  const selectedColor = watch('color');

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tagsApi.list();
      setTags(data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const openCreateModal = () => {
    setEditingTag(null);
    reset({ name: '', color: PRESET_COLORS[0] });
    setIsModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    reset({ name: tag.name, color: tag.color || PRESET_COLORS[0] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const onSubmit = async (data: TagFormData) => {
    setSubmitting(true);
    try {
      if (editingTag) {
        const updateData: UpdateTagInput = {
          name: data.name,
          color: data.color,
        };
        await tagsApi.update(editingTag.id, updateData);
        showToast('success', 'Тег обновлён');
      } else {
        const createData: CreateTagInput = {
          name: data.name,
          color: data.color,
        };
        await tagsApi.create(createData);
        showToast('success', 'Тег создан');
      }
      closeModal();
      loadTags();
    } catch (err) {
      showToast('error', extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTag) return;
    try {
      await tagsApi.delete(deleteTag.id);
      showToast('success', 'Тег удалён');
      setDeleteTag(null);
      loadTags();
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка тегов..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadTags} />;
  }

  return (
    <div className="tags-page">
      <div className="page-header">
        <h1>🏷️ Теги</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Новый тег
        </button>
      </div>

      {tags.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Нет тегов"
          description="Создайте теги для организации задач"
          action={{ label: 'Создать тег', onClick: openCreateModal }}
        />
      ) : (
        <div className="tags-grid">
          {tags.map((tag) => (
            <div key={tag.id} className="tag-card">
              <div className="tag-preview" style={{ backgroundColor: tag.color || '#6b7280' }}>
                <span className="tag-icon">🏷️</span>
              </div>
              <div className="tag-info">
                <h3>{tag.name}</h3>
                <span className="tag-color-value">{tag.color || 'Нет цвета'}</span>
              </div>
              <div className="tag-actions">
                <button className="btn btn-sm btn-outline" onClick={() => openEditModal(tag)}>
                  ✏️
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setDeleteTag(tag)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTag ? 'Редактировать тег' : 'Новый тег'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="name">Название *</label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={errors.name ? 'input-error' : ''}
                  placeholder="Например: Работа"
                  disabled={submitting}
                />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>
              
              <div className="form-group">
                <label>Цвет</label>
                <div className="color-picker">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setValue('color', color)}
                      disabled={submitting}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  {...register('color')}
                  className="color-input"
                  disabled={submitting}
                />
              </div>
              
              <div className="form-group">
                <label>Предпросмотр</label>
                <div className="tag-preview-block">
                  <span
                    className="tag-badge tag-badge--lg"
                    style={{ backgroundColor: selectedColor || '#6b7280' }}
                  >
                    {watch('name') || 'Название тега'}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={submitting}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Сохранение...' : editingTag ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      <ConfirmDialog
        isOpen={!!deleteTag}
        title="Удалить тег?"
        message={`Вы уверены, что хотите удалить тег "${deleteTag?.name}"? Тег будет удалён со всех задач.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTag(null)}
        isDanger
      />
    </div>
  );
}
