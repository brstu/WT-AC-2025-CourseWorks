import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { formsApi } from '../api';
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
import type { Form, FormField } from '../types';

const fieldSchema = z.object({
  name: z.string().min(1, 'Имя поля обязательно').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Имя поля должно быть валидным идентификатором'),
  label: z.string().min(1, 'Метка поля обязательна'),
  type: z.enum(['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox']),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Название формы обязательно').max(200),
  description: z.string().max(2000).optional().nullable(),
  fields: z.array(fieldSchema).min(1, 'Форма должна содержать хотя бы одно поле'),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

const fieldTypes = [
  { value: 'text', label: 'Текст' },
  { value: 'textarea', label: 'Многострочный текст' },
  { value: 'number', label: 'Число' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Дата' },
  { value: 'select', label: 'Выбор из списка' },
  { value: 'checkbox', label: 'Флажок' },
];

export const FormFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [existingForm, setExistingForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      fields: [{ name: '', label: '', type: 'text', required: false, placeholder: '', options: [] }],
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  const watchFields = watch('fields');

  const loadForm = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await formsApi.get(id);
      setExistingForm(data);
      reset({
        name: data.name,
        description: data.description || '',
        fields: data.fields.map((f: FormField) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required || false,
          placeholder: f.placeholder || '',
          options: f.options || [],
        })),
        isActive: data.isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки формы');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isEdit) {
      loadForm();
    }
  }, [isEdit, loadForm]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Очищаем options для полей, которые не select
      const cleanedFields = data.fields.map((f) => ({
        ...f,
        options: f.type === 'select' ? f.options : undefined,
      }));

      if (isEdit && id) {
        await formsApi.update(id, { ...data, fields: cleanedFields });
        navigate(`/forms/${id}`);
      } else {
        const created = await formsApi.create({ ...data, fields: cleanedFields });
        navigate(`/forms/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addField = () => {
    append({ name: '', label: '', type: 'text', required: false, placeholder: '', options: [] });
  };

  if (isLoading) {
    return <Loading size="lg" text="Загрузка формы..." />;
  }

  return (
    <div className="page-form-form">
      <div className="page-header">
        <Link to="/forms" className="back-link">
          <ArrowLeft size={18} />
          Назад к списку
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h1>{isEdit ? 'Редактирование формы' : 'Новая форма'}</h1>
        </CardHeader>
        <CardBody>
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} data-testid="form-form" className="form-editor">
            <div className="form-editor-basic">
              <Input
                label="Название формы"
                placeholder="Введите название"
                required
                error={errors.name?.message}
                {...register('name')}
              />

              <Textarea
                label="Описание"
                placeholder="Опишите назначение формы"
                error={errors.description?.message}
                {...register('description')}
                rows={3}
              />

              <div className="form-field form-field-checkbox">
                <label className="checkbox-label">
                  <input type="checkbox" {...register('isActive')} />
                  <span>Активна (доступна для создания заявок)</span>
                </label>
              </div>
            </div>

            <div className="form-editor-fields">
              <div className="form-editor-fields-header">
                <h2>Поля формы</h2>
                <Button type="button" variant="secondary" size="sm" onClick={addField}>
                  <Plus size={16} />
                  Добавить поле
                </Button>
              </div>

              {errors.fields?.message && (
                <Alert variant="error">{errors.fields.message}</Alert>
              )}

              <div className="fields-editor">
                {fields.map((field, index) => (
                  <div key={field.id} className="field-editor">
                    <div className="field-editor-header">
                      <GripVertical size={16} className="field-editor-drag" />
                      <span className="field-editor-number">Поле {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="field-editor-remove"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="field-editor-grid">
                      <Input
                        label="Имя поля (идентификатор)"
                        placeholder="field_name"
                        required
                        error={errors.fields?.[index]?.name?.message}
                        {...register(`fields.${index}.name`)}
                      />

                      <Input
                        label="Метка (отображаемое название)"
                        placeholder="Название поля"
                        required
                        error={errors.fields?.[index]?.label?.message}
                        {...register(`fields.${index}.label`)}
                      />

                      <Select
                        label="Тип поля"
                        options={fieldTypes}
                        error={errors.fields?.[index]?.type?.message}
                        {...register(`fields.${index}.type`)}
                      />

                      <Input
                        label="Подсказка (placeholder)"
                        placeholder="Введите подсказку"
                        {...register(`fields.${index}.placeholder`)}
                      />

                      {watchFields[index]?.type === 'select' && (
                        <Input
                          label="Варианты (через запятую)"
                          placeholder="Вариант 1, Вариант 2, Вариант 3"
                          {...register(`fields.${index}.options`, {
                            setValueAs: (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v),
                          })}
                        />
                      )}

                      <div className="form-field form-field-checkbox">
                        <label className="checkbox-label">
                          <input type="checkbox" {...register(`fields.${index}.required`)} />
                          <span>Обязательное поле</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <Link to="/forms">
                <Button variant="secondary" type="button">
                  Отмена
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                data-testid="submit-btn"
              >
                {isEdit ? 'Сохранить' : 'Создать форму'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
