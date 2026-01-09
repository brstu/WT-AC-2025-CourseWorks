import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { statusesApi } from '../api';
import { useAuth } from '../contexts';
import {
  Button,
  Card,
  CardBody,
  Badge,
  Loading,
  EmptyState,
  Alert,
  ConfirmDialog,
  Modal,
  Input,
  Textarea,
} from '../components';
import type { Status, StatusCreateDto } from '../types';

export const StatusesPage: React.FC = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editStatus, setEditStatus] = useState<Status | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<StatusCreateDto>({
    name: '',
    description: '',
    color: '#3b82f6',
    order: 0,
    isFinal: false,
  });

  const isAdmin = user?.role === 'admin';

  const loadStatuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await statusesApi.list();
      setStatuses(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статусов');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const openCreateModal = () => {
    setEditStatus(null);
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      order: statuses.length,
      isFinal: false,
    });
    setShowModal(true);
  };

  const openEditModal = (status: Status) => {
    setEditStatus(status);
    setFormData({
      name: status.name,
      description: status.description || '',
      color: status.color || '#3b82f6',
      order: status.order || 0,
      isFinal: status.isFinal,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditStatus(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (editStatus) {
        await statusesApi.update(editStatus.id, formData);
      } else {
        await statusesApi.create(formData);
      }
      closeModal();
      loadStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await statusesApi.delete(deleteId);
      setDeleteId(null);
      loadStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Загрузка статусов..." />;
  }

  return (
    <div className="page-statuses">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Статусы заявок</h1>
          <p className="page-header-subtitle">
            Управление статусами для отслеживания заявок
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openCreateModal} data-testid="create-btn">
            <Plus size={18} />
            Новый статус
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!statuses.length ? (
        <EmptyState
          title="Статусов пока нет"
          description={isAdmin ? 'Создайте статусы для отслеживания заявок' : 'Статусы заявок отсутствуют'}
          action={
            isAdmin ? (
              <Button variant="primary" onClick={openCreateModal}>
                <Plus size={18} />
                Создать статус
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="statuses-list">
          {statuses.map((status) => (
            <Card key={status.id} className="status-card" data-testid={`item-${status.id}`}>
              <CardBody>
                <div className="status-card-content">
                  <div className="status-card-info">
                    <div className="status-card-header">
                      <div
                        className="status-card-color"
                        style={{ backgroundColor: status.color || '#94a3b8' }}
                      />
                      <h3 className="status-card-name">{status.name}</h3>
                      {status.isFinal && (
                        <Badge variant="info">Финальный</Badge>
                      )}
                    </div>
                    {status.description && (
                      <p className="status-card-description">{status.description}</p>
                    )}
                    <span className="status-card-order">Порядок: {status.order || 0}</span>
                  </div>

                  {isAdmin && (
                    <div className="status-card-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(status)}
                        data-testid="edit-btn"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteId(status.id)}
                        data-testid="delete-btn"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editStatus ? 'Редактирование статуса' : 'Новый статус'}
        size="sm"
      >
        <div className="status-form">
          <Input
            label="Название"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: На рассмотрении"
            required
          />

          <Textarea
            label="Описание"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Описание статуса"
            rows={2}
          />

          <div className="form-row">
            <div className="form-field">
              <label className="form-field-label">Цвет</label>
              <input
                type="color"
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="form-field-color"
              />
            </div>

            <Input
              type="number"
              label="Порядок"
              value={formData.order?.toString() || '0'}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <div className="form-field form-field-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isFinal || false}
                onChange={(e) => setFormData({ ...formData, isFinal: e.target.checked })}
              />
              <span>Финальный статус (заявка закрыта)</span>
            </label>
          </div>

          <div className="status-form-actions">
            <Button variant="secondary" onClick={closeModal}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!formData.name}
              data-testid="submit-btn"
            >
              {editStatus ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удаление статуса"
        message="Вы уверены, что хотите удалить этот статус? Заявки с этим статусом могут стать некорректными."
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
