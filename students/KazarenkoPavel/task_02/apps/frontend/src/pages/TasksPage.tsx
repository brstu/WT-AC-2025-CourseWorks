import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tasksApi, tagsApi, extractError } from '../api';
import { Task, Tag, TaskPriority, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../types';
import { LoadingSpinner, ErrorMessage, EmptyState, ConfirmDialog, useToast } from '../components';

const taskSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  tagIds: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Низкий', color: '#10b981' },
  medium: { label: 'Средний', color: '#f59e0b' },
  high: { label: 'Высокий', color: '#ef4444' },
};

const STATUS_LABELS: Record<TaskStatus, { label: string; icon: string }> = {
  pending: { label: 'Ожидает', icon: '⏳' },
  in_progress: { label: 'В работе', icon: '🔄' },
  completed: { label: 'Завершена', icon: '✅' },
};

export function TasksPage() {
  const { showToast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Фильтры
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [filterTag, setFilterTag] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: 'pending',
      tagIds: [],
    },
  });

  const selectedTagIds = watch('tagIds') || [];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, tagsData] = await Promise.all([
        tasksApi.list({
          status: filterStatus || undefined,
          priority: filterPriority || undefined,
          tag: filterTag || undefined,
          limit: 100,
        }),
        tagsApi.list(),
      ]);
      setTasks(tasksData);
      setTags(tagsData);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterTag]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingTask(null);
    reset({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      tagIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      tagIds: task.tags.map((t) => t.id),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const toggleTag = (tagId: string) => {
    const current = selectedTagIds;
    if (current.includes(tagId)) {
      setValue('tagIds', current.filter((id: string) => id !== tagId));
    } else {
      setValue('tagIds', [...current, tagId]);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        const updateData: UpdateTaskInput = {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          tagIds: data.tagIds,
        };
        await tasksApi.update(editingTask.id, updateData);
        showToast('success', 'Задача обновлена');
      } else {
        const createData: CreateTaskInput = {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          tagIds: data.tagIds,
        };
        await tasksApi.create(createData);
        showToast('success', 'Задача создана');
      }
      closeModal();
      loadData();
    } catch (err) {
      showToast('error', extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      await tasksApi.delete(deleteTask.id);
      showToast('success', 'Задача удалена');
      setDeleteTask(null);
      loadData();
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await tasksApi.update(task.id, { status: newStatus });
      showToast('success', `Статус изменён на "${STATUS_LABELS[newStatus].label}"`);
      loadData();
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  if (loading && tasks.length === 0) {
    return <LoadingSpinner text="Загрузка задач..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>📋 Задачи</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Новая задача
        </button>
      </div>

      {/* Фильтры */}
      <div className="filters-bar">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}>
          <option value="">Все статусы</option>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status].icon} {STATUS_LABELS[status].label}
            </option>
          ))}
        </select>
        
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')}>
          <option value="">Все приоритеты</option>
          {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority].label}
            </option>
          ))}
        </select>
        
        <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
          <option value="">Все теги</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        
        {(filterStatus || filterPriority || filterTag) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFilterStatus('');
              setFilterPriority('');
              setFilterTag('');
            }}
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Список задач */}
      {tasks.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Нет задач"
          description="Создайте первую задачу для начала работы"
          action={{ label: 'Создать задачу', onClick: openCreateModal }}
        />
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card task-card--${task.status}`}>
              <div className="task-header">
                <div className="task-status-wrapper">
                  <select
                    className="task-status-select"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                  >
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status].icon} {STATUS_LABELS[status].label}
                      </option>
                    ))}
                  </select>
                </div>
                <h3 className="task-title">{task.title}</h3>
                <span
                  className="task-priority"
                  style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }}
                >
                  {PRIORITY_LABELS[task.priority].label}
                </span>
              </div>
              
              {task.description && <p className="task-description">{task.description}</p>}
              
              {task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="tag-badge"
                      style={{ backgroundColor: tag.color || '#6b7280' }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="task-actions">
                <button className="btn btn-sm btn-outline" onClick={() => openEditModal(task)}>
                  ✏️ Редактировать
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setDeleteTask(task)}>
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания/редактирования */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTask ? 'Редактировать задачу' : 'Новая задача'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="title">Название *</label>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  className={errors.title ? 'input-error' : ''}
                  disabled={submitting}
                />
                {errors.title && <span className="form-error">{errors.title.message}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  disabled={submitting}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Приоритет</label>
                  <select id="priority" {...register('priority')} disabled={submitting}>
                    {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
                      <option key={priority} value={priority}>
                        {PRIORITY_LABELS[priority].label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Статус</label>
                  <select id="status" {...register('status')} disabled={submitting}>
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Теги</label>
                <div className="tags-selector">
                  {tags.length === 0 ? (
                    <span className="text-muted">Нет тегов. Создайте теги в разделе "Теги".</span>
                  ) : (
                    tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`tag-btn ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                        style={{
                          borderColor: tag.color || '#6b7280',
                          backgroundColor: selectedTagIds.includes(tag.id) ? tag.color || '#6b7280' : 'transparent',
                          color: selectedTagIds.includes(tag.id) ? '#fff' : tag.color || '#6b7280',
                        }}
                        onClick={() => toggleTag(tag.id)}
                        disabled={submitting}
                      >
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={submitting}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Сохранение...' : editingTask ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      <ConfirmDialog
        isOpen={!!deleteTask}
        title="Удалить задачу?"
        message={`Вы уверены, что хотите удалить задачу "${deleteTask?.title}"? Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTask(null)}
        isDanger
      />
    </div>
  );
}
