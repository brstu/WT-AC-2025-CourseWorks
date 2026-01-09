import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { applicationsApi, formsApi } from '../api';
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardBody,
  CardHeader,
  Loading,
  Alert,
} from '../components';
import type { Form, Application, FormField } from '../types';

const applicationSchema = z.object({
  formId: z.string().uuid('Выберите форму заявки'),
  data: z.record(z.string(), z.any()),
  comment: z.string().max(5000).optional().nullable(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export const ApplicationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      formId: '',
      data: {},
      comment: '',
    },
  });

  const watchFormId = watch('formId');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formsData = await formsApi.list();
      setForms(formsData);

      if (isEdit && id) {
        const appData = await applicationsApi.get(id);
        setApplication(appData);
        reset({
          formId: appData.formId,
          data: appData.data as Record<string, unknown>,
          comment: appData.comment || '',
        });
        const form = formsData.find((f) => f.id === appData.formId);
        setSelectedForm(form || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, [id, isEdit, reset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (watchFormId && !isEdit) {
      const form = forms.find((f) => f.id === watchFormId);
      setSelectedForm(form || null);
      if (form) {
        // Инициализируем data пустыми значениями для новой формы
        const initialData: Record<string, unknown> = {};
        form.fields.forEach((field) => {
          initialData[field.name] = field.type === 'checkbox' ? false : '';
        });
        setValue('data', initialData);
      }
    }
  }, [watchFormId, forms, isEdit, setValue]);

  const onSubmit = async (formData: ApplicationFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEdit && id) {
        await applicationsApi.update(id, {
          data: formData.data,
          comment: formData.comment || null,
        });
        navigate(`/applications/${id}`);
      } else {
        const created = await applicationsApi.create({
          formId: formData.formId,
          data: formData.data,
          comment: formData.comment || null,
        });
        navigate(`/applications/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldName = `data.${field.name}` as const;
    const fieldError = (errors.data as Record<string, { message?: string }>)?.[field.name]?.message;

    switch (field.type) {
      case 'textarea':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <Textarea
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                error={fieldError}
                {...controllerField}
                value={controllerField.value as string || ''}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <Select
                label={field.label}
                placeholder={field.placeholder || 'Выберите...'}
                required={field.required}
                error={fieldError}
                options={(field.options || []).map((opt) => ({ value: opt, label: opt }))}
                {...controllerField}
                value={controllerField.value as string || ''}
              />
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <div className="form-field form-field-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!!controllerField.value}
                    onChange={(e) => controllerField.onChange(e.target.checked)}
                  />
                  <span>{field.label}</span>
                </label>
                {fieldError && (
                  <span className="form-field-error-message" data-testid="error-message">
                    {fieldError}
                  </span>
                )}
              </div>
            )}
          />
        );

      case 'number':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <Input
                type="number"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                error={fieldError}
                {...controllerField}
                value={controllerField.value as string || ''}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <Input
                type="date"
                label={field.label}
                required={field.required}
                error={fieldError}
                {...controllerField}
                value={controllerField.value as string || ''}
              />
            )}
          />
        );

      case 'email':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <Input
                type="email"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                error={fieldError}
                {...controllerField}
                value={controllerField.value as string || ''}
              />
            )}
          />
        );

      default:
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <Input
                type="text"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                error={fieldError}
                {...controllerField}
                value={controllerField.value as string || ''}
              />
            )}
          />
        );
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Загрузка..." />;
  }

  return (
    <div className="page-application-form">
      <div className="page-header">
        <Link to="/applications" className="back-link">
          <ArrowLeft size={18} />
          Назад к списку
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h1>{isEdit ? 'Редактирование заявки' : 'Новая заявка'}</h1>
        </CardHeader>
        <CardBody>
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            data-testid="application-form"
            className="application-form"
          >
            {!isEdit && (
              <Select
                label="Форма заявки"
                placeholder="Выберите форму"
                required
                error={errors.formId?.message}
                options={forms.map((f) => ({
                  value: f.id,
                  label: f.isActive ? f.name : `${f.name} (неактивна)`
                }))}
                {...register('formId')}
              />
            )}

            {selectedForm && (
              <>
                {selectedForm.description && (
                  <p className="form-description">{selectedForm.description}</p>
                )}
                <div className="form-fields">
                  {selectedForm.fields.map(renderField)}
                </div>
              </>
            )}

            <Textarea
              label="Комментарий"
              placeholder="Добавьте комментарий (необязательно)"
              error={errors.comment?.message}
              {...register('comment')}
              rows={3}
            />

            <div className="form-actions">
              <Link to="/applications">
                <Button variant="secondary" type="button">
                  Отмена
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!selectedForm}
                data-testid="submit-btn"
              >
                {isEdit ? 'Сохранить' : 'Создать заявку'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
