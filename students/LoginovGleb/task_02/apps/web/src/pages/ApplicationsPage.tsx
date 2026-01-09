import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Trash2, Send, RotateCcw } from 'lucide-react';
import { applicationsApi, statusesApi, formsApi } from '../api';
import { useAuth } from '../contexts';
import {
  Button,
  Card,
  CardBody,
  Badge,
  Loading,
  EmptyState,
  Alert,
  Select,
  ConfirmDialog,
} from '../components';
import type { Application, Status, Form, PaginatedResponse } from '../types';

export const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [applications, setApplications] = useState<PaginatedResponse<Application> | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const statusFilter = searchParams.get('statusId') || '';
  const formFilter = searchParams.get('formId') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appsData, statusesData, formsData] = await Promise.all([
        applicationsApi.list({
          statusId: statusFilter || undefined,
          formId: formFilter || undefined,
          page,
          pageSize: 10,
        }),
        statusesApi.list(),
        formsApi.list(),
      ]);
      setApplications(appsData);
      setStatuses(statusesData);
      setForms(formsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, formFilter, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await applicationsApi.delete(deleteId);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!submitId) return;
    setIsSubmitting(true);
    try {
      await applicationsApi.submit(submitId);
      setSubmitId(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawId) return;
    setIsWithdrawing(true);
    try {
      await applicationsApi.withdraw(withdrawId);
      setWithdrawId(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отзыва');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusByName = (name: string) => statuses.find(s => s.name === name);
  const isDraft = (app: Application) => app.status?.name === 'draft';
  const isPending = (app: Application) => app.status?.name === 'pending';
  const isOwner = (app: Application) => app.userId === user?.id;

  const canEdit = (app: Application) => (isOwner(app) || isAdmin) && isDraft(app);
  const canDelete = (app: Application) => (isOwner(app) && isDraft(app)) || isAdmin;
  const canSubmit = (app: Application) => (isOwner(app) || isAdmin) && isDraft(app);
  const canWithdraw = (app: Application) => (isOwner(app) || isAdmin) && isPending(app);

  if (isLoading) {
    return <Loading size="lg" text="Загрузка заявок..." />;
  }

  return (
    <div className="page-applications">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Заявки</h1>
          <p className="page-header-subtitle">
            {isModerator ? 'Все заявки в системе' : 'Ваши заявки'}
          </p>
        </div>
        <Link to="/applications/new">
          <Button variant="primary" data-testid="create-btn">
            <Plus size={18} />
            Новая заявка
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="filters-card">
        <CardBody>
          <div className="filters">
            <Select
              label="Статус"
              value={statusFilter}
              onChange={(e) => handleFilterChange('statusId', e.target.value)}
              options={statuses.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Все статусы"
            />
            <Select
              label="Форма"
              value={formFilter}
              onChange={(e) => handleFilterChange('formId', e.target.value)}
              options={forms.map((f) => ({ value: f.id, label: f.name }))}
              placeholder="Все формы"
            />
          </div>
        </CardBody>
      </Card>

      {!applications?.items.length ? (
        <EmptyState
          title="Заявок пока нет"
          description="Создайте первую заявку, чтобы начать работу"
          action={
            <Link to="/applications/new">
              <Button variant="primary">
                <Plus size={18} />
                Создать заявку
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="applications-list">
            {applications.items.map((app) => (
              <Card key={app.id} className="application-card" data-testid={`item-${app.id}`}>
                <CardBody>
                  <div className="application-card-header">
                    <div className="application-card-info">
                      <h3 className="application-card-title">
                        {app.form?.name || 'Заявка'}
                      </h3>
                      <p className="application-card-meta">
                        Создана: {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                        {app.submittedAt && (
                          <> • Отправлена: {new Date(app.submittedAt).toLocaleDateString('ru-RU')}</>
                        )}
                      </p>
                    </div>
                    <Badge color={app.status?.color || undefined}>
                      {app.status?.name || 'Неизвестно'}
                    </Badge>
                  </div>
                  
                  {app.comment && (
                    <p className="application-card-comment">{app.comment}</p>
                  )}

                  <div className="application-card-actions">
                    <Link to={`/applications/${app.id}`}>
                      <Button variant="ghost" size="sm" data-testid="view-btn">
                        <Eye size={16} />
                        Просмотр
                      </Button>
                    </Link>
                    
                    {canEdit(app) && (
                      <Link to={`/applications/${app.id}/edit`}>
                        <Button variant="ghost" size="sm" data-testid="edit-btn">
                          Редактировать
                        </Button>
                      </Link>
                    )}
                    
                    {canSubmit(app) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSubmitId(app.id)}
                        data-testid="submit-app-btn"
                      >
                        <Send size={16} />
                        Отправить
                      </Button>
                    )}
                    
                    {canWithdraw(app) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setWithdrawId(app.id)}
                        data-testid="withdraw-btn"
                      >
                        <RotateCcw size={16} />
                        Отозвать
                      </Button>
                    )}
                    
                    {canDelete(app) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteId(app.id)}
                        data-testid="delete-btn"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {applications.total > applications.pageSize && (
            <div className="pagination">
              <Button
                variant="ghost"
                disabled={page <= 1}
                onClick={() => handleFilterChange('page', String(page - 1))}
              >
                Назад
              </Button>
              <span className="pagination-info">
                Страница {page} из {Math.ceil(applications.total / applications.pageSize)}
              </span>
              <Button
                variant="ghost"
                disabled={page >= Math.ceil(applications.total / applications.pageSize)}
                onClick={() => handleFilterChange('page', String(page + 1))}
              >
                Вперёд
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удаление заявки"
        message="Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!submitId}
        onClose={() => setSubmitId(null)}
        onConfirm={handleSubmit}
        title="Отправка заявки"
        message="Вы уверены, что хотите отправить заявку на рассмотрение? После отправки редактирование будет недоступно."
        confirmText="Отправить"
        variant="primary"
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={!!withdrawId}
        onClose={() => setWithdrawId(null)}
        onConfirm={handleWithdraw}
        title="Отзыв заявки"
        message="Вы уверены, что хотите отозвать заявку?"
        confirmText="Отозвать"
        variant="danger"
        isLoading={isWithdrawing}
      />
    </div>
  );
};
