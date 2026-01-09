import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, RotateCcw, Trash2, Edit } from 'lucide-react';
import { applicationsApi, statusesApi } from '../api';
import { useAuth } from '../contexts';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Loading,
  Alert,
  Select,
  Textarea,
  ConfirmDialog,
  Modal,
} from '../components';
import type { Application, Status } from '../types';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusId, setNewStatusId] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;
  const isOwner = application?.userId === user?.id;

  const isDraft = application?.status?.name === 'draft';
  const isPending = application?.status?.name === 'pending';

  const canEdit = (isOwner || isAdmin) && isDraft;
  const canDelete = (isOwner && isDraft) || isAdmin;
  const canSubmit = (isOwner || isAdmin) && isDraft;
  const canWithdraw = (isOwner || isAdmin) && isPending;
  const canChangeStatus = isModerator;

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [appData, statusesData] = await Promise.all([
        applicationsApi.get(id),
        isModerator ? statusesApi.list() : Promise.resolve([]),
      ]);
      setApplication(appData);
      setStatuses(statusesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки заявки');
    } finally {
      setIsLoading(false);
    }
  }, [id, isModerator]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await applicationsApi.delete(id);
      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await applicationsApi.submit(id);
      setShowSubmitDialog(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!id) return;
    setIsWithdrawing(true);
    try {
      await applicationsApi.withdraw(id);
      setShowWithdrawDialog(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отзыва');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!id || !newStatusId) return;
    setIsChangingStatus(true);
    try {
      await applicationsApi.changeStatus(id, {
        statusId: newStatusId,
        comment: statusComment || null,
      });
      setShowStatusModal(false);
      setNewStatusId('');
      setStatusComment('');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка изменения статуса');
    } finally {
      setIsChangingStatus(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Загрузка заявки..." />;
  }

  if (!application) {
    return (
      <div className="page-container">
        <Alert variant="error">Заявка не найдена</Alert>
        <Link to="/applications">
          <Button variant="ghost">
            <ArrowLeft size={18} />
            Назад к списку
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-application-detail">
      <div className="page-header">
        <Link to="/applications" className="back-link">
          <ArrowLeft size={18} />
          Назад к списку
        </Link>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="application-detail">
        <Card className="application-detail-main">
          <CardHeader>
            <div className="application-detail-header">
              <div>
                <h1>{application.form?.name || 'Заявка'}</h1>
                <p className="application-detail-meta">
                  ID: {application.id}
                </p>
              </div>
              <Badge color={application.status?.color || undefined}>
                {application.status?.name || 'Неизвестно'}
              </Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="application-detail-info">
              <div className="info-row">
                <span className="info-label">Дата создания:</span>
                <span className="info-value">
                  {new Date(application.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
              {application.submittedAt && (
                <div className="info-row">
                  <span className="info-label">Дата отправки:</span>
                  <span className="info-value">
                    {new Date(application.submittedAt).toLocaleString('ru-RU')}
                  </span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Автор:</span>
                <span className="info-value">{application.user?.username}</span>
              </div>
              {application.comment && (
                <div className="info-row info-row-full">
                  <span className="info-label">Комментарий:</span>
                  <span className="info-value">{application.comment}</span>
                </div>
              )}
            </div>

            <div className="application-detail-data">
              <h3>Данные заявки</h3>
              <div className="data-grid">
                {Object.entries(application.data as Record<string, unknown>).map(([key, value]) => (
                  <div key={key} className="data-item">
                    <span className="data-label">{key}</span>
                    <span className="data-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="application-detail-actions">
              {canEdit && (
                <Link to={`/applications/${id}/edit`}>
                  <Button variant="secondary" data-testid="edit-btn">
                    <Edit size={18} />
                    Редактировать
                  </Button>
                </Link>
              )}
              {canSubmit && (
                <Button
                  variant="primary"
                  onClick={() => setShowSubmitDialog(true)}
                  data-testid="submit-app-btn"
                >
                  <Send size={18} />
                  Отправить
                </Button>
              )}
              {canWithdraw && (
                <Button
                  variant="secondary"
                  onClick={() => setShowWithdrawDialog(true)}
                  data-testid="withdraw-btn"
                >
                  <RotateCcw size={18} />
                  Отозвать
                </Button>
              )}
              {canChangeStatus && (
                <Button
                  variant="secondary"
                  onClick={() => setShowStatusModal(true)}
                  data-testid="change-status-btn"
                >
                  Изменить статус
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteDialog(true)}
                  data-testid="delete-btn"
                >
                  <Trash2 size={18} />
                  Удалить
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {application.history && application.history.length > 0 && (
          <Card className="application-detail-history">
            <CardHeader>
              <h2>История изменений</h2>
            </CardHeader>
            <CardBody>
              <div className="history-list">
                {application.history.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-header">
                      <span className="history-item-user">{item.changedBy?.username}</span>
                      <span className="history-item-date">
                        {new Date(item.changedAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <div className="history-item-change">
                      {item.fromStatus ? (
                        <>
                          <Badge color={item.fromStatus.color || undefined}>
                            {item.fromStatus.name}
                          </Badge>
                          <span className="history-item-arrow">→</span>
                        </>
                      ) : null}
                      <Badge color={item.toStatus.color || undefined}>
                        {item.toStatus.name}
                      </Badge>
                    </div>
                    {item.comment && (
                      <p className="history-item-comment">{item.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Удаление заявки"
        message="Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={handleSubmit}
        title="Отправка заявки"
        message="Вы уверены, что хотите отправить заявку на рассмотрение?"
        confirmText="Отправить"
        variant="primary"
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        onConfirm={handleWithdraw}
        title="Отзыв заявки"
        message="Вы уверены, что хотите отозвать заявку?"
        confirmText="Отозвать"
        variant="danger"
        isLoading={isWithdrawing}
      />

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Изменение статуса"
        size="sm"
      >
        <div className="status-change-form">
          <Select
            label="Новый статус"
            value={newStatusId}
            onChange={(e) => setNewStatusId(e.target.value)}
            options={statuses.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Выберите статус"
            required
          />
          <Textarea
            label="Комментарий"
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            placeholder="Добавьте комментарий (необязательно)"
            rows={3}
          />
          <div className="status-change-form-actions">
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleChangeStatus}
              isLoading={isChangingStatus}
              disabled={!newStatusId}
              data-testid="confirm-status-btn"
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
