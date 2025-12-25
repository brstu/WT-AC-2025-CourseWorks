import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  listRequests,
  createRequest,
  deleteRequest,
  updateRequest,
  listCategories
} from "../lib/api";
import type { HelpRequest, HelpRequestStatus, Category } from "../types";
import { useAuth } from "../contexts/AuthContext";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  categoryId: z.string().uuid(),
  locationAddress: z.string().min(3)
});

type CreateForm = z.infer<typeof createSchema>;

type UpdateForm = Partial<CreateForm> & { status?: HelpRequestStatus };

export default function RequestsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<HelpRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors }
  } = useForm<UpdateForm>({ defaultValues: {} });

  const statusOptions: HelpRequestStatus[] = ["new", "assigned", "in_progress", "completed", "cancelled"];

  const canCreate = user?.role === "user" || user?.role === "admin";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqs, cats] = await Promise.all([listRequests(), listCategories()]);
      setItems(reqs.items);
      setCategories(cats.items);
      reset({ title: "", description: "", categoryId: cats.items[0]?.id, locationAddress: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить запросы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (data: CreateForm) => {
    setError(null);
    await createRequest(data);
    await fetchData();
  };

  const onDelete = async (id: string) => {
    setError(null);
    await deleteRequest(id);
    await fetchData();
  };

  const onStartEdit = (item: HelpRequest) => {
    setEditId(item.id);
    resetEdit({
      title: item.title,
      description: item.description,
      categoryId: item.categoryId,
      locationAddress: item.locationAddress,
      status: item.status
    });
  };

  const onEdit = async (values: UpdateForm) => {
    if (!editId) return;
    await updateRequest(editId, values);
    setEditId(null);
    await fetchData();
  };

  const categoriesMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  return (
    <div className="card">
      <div className="item-header" style={{ marginBottom: 12 }}>
        <div>
          <h2>Запросы помощи</h2>
          <p className="muted">Доступ зависят от роли и владения.</p>
        </div>
        <div className="badge">{items.length} шт.</div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Загрузка...</div>}

      {canCreate && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Создать запрос</h3>
          <form onSubmit={handleSubmit(onCreate)}>
            <label>
              Заголовок
              <input {...register("title")} placeholder="Нужна помощь" />
              {errors.title && <span className="error">{errors.title.message}</span>}
            </label>
            <label>
              Описание
              <textarea {...register("description")} placeholder="Опишите задачу" />
              {errors.description && <span className="error">{errors.description.message}</span>}
            </label>
            <label>
              Категория
              <select {...register("categoryId")}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="error">{errors.categoryId.message}</span>}
            </label>
            <label>
              Адрес
              <input {...register("locationAddress")} placeholder="Город, улица" />
              {errors.locationAddress && <span className="error">{errors.locationAddress.message}</span>}
            </label>
            <button className="btn primary" type="submit">
              Создать
            </button>
          </form>
        </div>
      )}

      <div className="list">
        {items.map((item) => {
          const isOwner = item.userId === user?.id;
          const canEdit = user?.role === "admin" || isOwner;
          const canDelete = user?.role === "admin" || (isOwner && item.status === "new");
          return (
            <div key={item.id} className="item">
              <div className="item-header">
                <div>
                  <strong>{item.title}</strong>
                  <div className="muted">{item.description}</div>
                  <div className="flex-row">
                    <span className="badge">{categoriesMap[item.categoryId] || "Категория"}</span>
                    <span className="status">{item.status}</span>
                  </div>
                  <div className="muted">Адрес: {item.locationAddress}</div>
                </div>
                <div className="item-actions">
                  {canEdit && (
                    <button className="btn" onClick={() => onStartEdit(item)}>
                      Редактировать
                    </button>
                  )}
                  {canDelete && (
                    <button className="btn danger" onClick={() => onDelete(item.id)}>
                      Удалить
                    </button>
                  )}
                </div>
              </div>

              {editId === item.id && (
                <form className="inline-form" onSubmit={handleEditSubmit(onEdit)} style={{ marginTop: 12 }}>
                  <input placeholder="Заголовок" {...registerEdit("title")} />
                  <input placeholder="Описание" {...registerEdit("description")} />
                  <select {...registerEdit("categoryId")}>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {user?.role === "admin" && (
                    <select {...registerEdit("status")}>
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                  <input placeholder="Адрес" {...registerEdit("locationAddress")} />
                  {editErrors.description && <span className="error">{editErrors.description.message}</span>}
                  <div className="section-actions">
                    <button className="btn primary" type="submit">
                      Сохранить
                    </button>
                    <button className="btn" type="button" onClick={() => setEditId(null)}>
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
        {!items.length && !loading && <div className="muted">Пусто</div>}
      </div>
    </div>
  );
}
