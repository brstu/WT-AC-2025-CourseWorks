import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { listReviews, createReview, updateReview, deleteReview, listAssignments } from "../lib/api";
import type { Review, Assignment } from "../types";
import { useAuth } from "../contexts/AuthContext";

const createSchema = z.object({
  assignmentId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional()
});

type CreateForm = z.infer<typeof createSchema>;

const updateSchema = z.object({ rating: z.coerce.number().int().min(1).max(5).optional(), comment: z.string().optional() });

type UpdateForm = z.infer<typeof updateSchema>;

export default function ReviewsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
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
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors }
  } = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rev, assign] = await Promise.all([listReviews(), listAssignments({ status: "completed" })]);
      setItems(rev.items);
      setAssignments(assign.items);
      reset({ assignmentId: assign.items[0]?.id, rating: 5, comment: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить отзывы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (values: CreateForm) => {
    await createReview(values);
    await load();
  };

  const onUpdate = async (id: string, values: UpdateForm) => {
    await updateReview(id, values);
    setEditId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    await deleteReview(id);
    await load();
  };

  return (
    <div className="card">
      <div className="item-header" style={{ marginBottom: 12 }}>
        <div>
          <h2>Отзывы</h2>
          <p className="muted">Оставляет владелец запроса по завершённому назначению.</p>
        </div>
        <div className="badge">{items.length}</div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Загрузка...</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Создать отзыв</h3>
        <form onSubmit={handleSubmit(onCreate)} className="inline-form">
          <select {...register("assignmentId")}> 
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.request?.title ?? a.id}
              </option>
            ))}
          </select>
          <input type="number" min={1} max={5} {...register("rating")} />
          <input placeholder="Комментарий" {...register("comment")} />
          {errors.assignmentId && <span className="error">{errors.assignmentId.message}</span>}
          {errors.rating && <span className="error">{errors.rating.message}</span>}
          <button className="btn primary" type="submit">
            Сохранить
          </button>
        </form>
        <p className="muted">Assignment должен быть completed и принадлежать вашему запросу (проверит backend).</p>
      </div>

      <div className="list">
        {items.map((r) => {
          const isOwner = r.userId === user?.id;
          const isAdmin = user?.role === "admin";
          const canManage = isOwner || isAdmin;
          return (
            <div key={r.id} className="item">
              <div className="item-header">
                <div>
                  <strong>Оценка: {r.rating}</strong>
                  <div className="muted">Комментарий: {r.comment || "—"}</div>
                </div>
                {canManage && (
                  <div className="item-actions">
                    <button className="btn" onClick={() => { setEditId(r.id); resetEdit({ rating: r.rating, comment: r.comment ?? "" }); }}>
                      Редактировать
                    </button>
                    <button className="btn danger" onClick={() => onDelete(r.id)}>
                      Удалить
                    </button>
                  </div>
                )}
              </div>
              {editId === r.id && (
                <form className="inline-form" onSubmit={handleSubmitEdit((vals) => onUpdate(r.id, vals))}>
                  <input type="number" min={1} max={5} {...registerEdit("rating")} />
                  <input placeholder="Комментарий" {...registerEdit("comment")} />
                  {editErrors.rating && <span className="error">{editErrors.rating.message}</span>}
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
        {!items.length && !loading && <div className="muted">Нет отзывов</div>}
      </div>
    </div>
  );
}
