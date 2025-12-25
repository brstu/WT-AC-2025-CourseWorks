import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../lib/api";
import type { Category } from "../types";
import { useAuth } from "../contexts/AuthContext";

const schema = z.object({ name: z.string().min(2), description: z.string().optional() });
type FormValues = z.infer<typeof schema>;

export default function CategoriesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await listCategories();
      setItems(resp.items);
      reset({ name: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить категории");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (values: FormValues) => {
    await createCategory(values);
    await load();
  };

  const onEdit = async (values: FormValues) => {
    if (!editId) return;
    await updateCategory(editId, values);
    setEditId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    await deleteCategory(id);
    await load();
  };

  return (
    <div className="card">
      <div className="item-header" style={{ marginBottom: 12 }}>
        <div>
          <h2>Категории</h2>
          <p className="muted">Создание/редактирование только для admin.</p>
        </div>
        <div className="badge">{items.length}</div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Загрузка...</div>}

      {isAdmin && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Создать категорию</h3>
          <form onSubmit={handleSubmit(onCreate)}>
            <label>
              Название
              <input {...register("name")} />
              {errors.name && <span className="error">{errors.name.message}</span>}
            </label>
            <label>
              Описание
              <input {...register("description")} />
            </label>
            <button className="btn primary" type="submit">
              Добавить
            </button>
          </form>
        </div>
      )}

      <div className="list">
        {items.map((cat) => (
          <div key={cat.id} className="item">
            <div className="item-header">
              <div>
                <strong>{cat.name}</strong>
                {cat.description && <div className="muted">{cat.description}</div>}
              </div>
              {isAdmin && (
                <div className="item-actions">
                  <button
                    className="btn"
                    onClick={() => {
                      setEditId(cat.id);
                      resetEdit({ name: cat.name, description: cat.description || "" });
                    }}
                  >
                    Редактировать
                  </button>
                  <button className="btn danger" onClick={() => onDelete(cat.id)}>
                    Удалить
                  </button>
                </div>
              )}
            </div>
            {editId === cat.id && (
              <form className="inline-form" onSubmit={handleSubmitEdit(onEdit)} style={{ marginTop: 10 }}>
                <input placeholder="Название" {...registerEdit("name")} />
                <input placeholder="Описание" {...registerEdit("description")} />
                {editErrors.name && <span className="error">{editErrors.name.message}</span>}
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
        ))}
        {!items.length && !loading && <div className="muted">Категорий нет</div>}
      </div>
    </div>
  );
}
