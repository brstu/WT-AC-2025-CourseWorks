import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { formsApi } from '../api';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Loading,
  Alert,
} from '../components';
import type { Form } from '../types';

export const FormDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForm = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await formsApi.get(id);
      setForm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Форма не найдена');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  if (isLoading) {
    return <Loading size="lg" text="Загрузка формы..." />;
  }

  if (!form) {
    return (
      <div className="page-container">
        <Alert variant="error">Форма не найдена</Alert>
        <Link to="/forms">
          <Button variant="ghost">
            <ArrowLeft size={18} />
            Назад к списку
          </Button>
        </Link>
      </div>
    );
  }

  const fieldTypeLabels: Record<string, string> = {
    text: 'Текст',
    textarea: 'Многострочный текст',
    number: 'Число',
    email: 'Email',
    date: 'Дата',
    select: 'Выбор из списка',
    checkbox: 'Флажок',
  };

  return (
    <div className="page-form-detail">
      <div className="page-header">
        <Link to="/forms" className="back-link">
          <ArrowLeft size={18} />
          Назад к списку
        </Link>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="form-detail-header">
            <div>
              <h1>{form.name}</h1>
              {form.description && (
                <p className="form-detail-description">{form.description}</p>
              )}
            </div>
            <Badge variant={form.isActive ? 'success' : 'default'}>
              {form.isActive ? 'Активна' : 'Неактивна'}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <h2>Поля формы</h2>
          <div className="fields-list">
            {form.fields.map((field, index) => (
              <div key={field.name} className="field-item">
                <div className="field-item-header">
                  <span className="field-item-number">{index + 1}</span>
                  <h3 className="field-item-label">{field.label}</h3>
                  <Badge variant="info">{fieldTypeLabels[field.type] || field.type}</Badge>
                  {field.required && <Badge variant="warning">Обязательное</Badge>}
                </div>
                <div className="field-item-details">
                  <span className="field-item-name">Имя поля: {field.name}</span>
                  {field.placeholder && (
                    <span className="field-item-placeholder">
                      Подсказка: {field.placeholder}
                    </span>
                  )}
                  {field.options && field.options.length > 0 && (
                    <span className="field-item-options">
                      Варианты: {field.options.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {form.isActive && (
            <div className="form-detail-action">
              <Link to={`/applications/new?formId=${form.id}`}>
                <Button variant="primary" data-testid="create-application-btn">
                  <FileText size={18} />
                  Создать заявку по этой форме
                </Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
