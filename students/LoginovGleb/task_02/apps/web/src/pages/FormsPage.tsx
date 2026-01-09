import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { formsApi } from '../api';
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
} from '../components';
import type { Form } from '../types';

export const FormsPage: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await formsApi.list();
      setForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки форм');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await formsApi.delete(deleteId);
      setDeleteId(null);
      loadForms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Загрузка форм..." />;
  }

  return (
    <div className="page-forms">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Формы заявок</h1>
          <p className="page-header-subtitle">
            Шаблоны для создания заявок
          </p>
        </div>
        {isAdmin && (
          <Link to="/forms/new">
            <Button variant="primary" data-testid="create-btn">
              <Plus size={18} />
              Новая форма
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!forms.length ? (
        <EmptyState
          title="Форм пока нет"
          description={isAdmin ? 'Создайте первую форму для заявок' : 'Формы заявок отсутствуют'}
          action={
            isAdmin ? (
              <Link to="/forms/new">
                <Button variant="primary">
                  <Plus size={18} />
                  Создать форму
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="forms-grid">
          {forms.map((form) => (
            <Card key={form.id} className="form-card" data-testid={`item-${form.id}`}>
              <CardBody>
                <div className="form-card-header">
                  <h3 className="form-card-title">{form.name}</h3>
                  <Badge variant={form.isActive ? 'success' : 'default'}>
                    {form.isActive ? 'Активна' : 'Неактивна'}
                  </Badge>
                </div>
                
                {form.description && (
                  <p className="form-card-description">{form.description}</p>
                )}

                <p className="form-card-meta">
                  Полей: {form.fields.length}
                </p>

                <div className="form-card-actions">
                  <Link to={`/forms/${form.id}`}>
                    <Button variant="ghost" size="sm" data-testid="view-btn">
                      <Eye size={16} />
                      Просмотр
                    </Button>
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Link to={`/forms/${form.id}/edit`}>
                        <Button variant="ghost" size="sm" data-testid="edit-btn">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteId(form.id)}
                        data-testid="delete-btn"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удаление формы"
        message="Вы уверены, что хотите удалить эту форму? Заявки, созданные на основе этой формы, будут сохранены."
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
