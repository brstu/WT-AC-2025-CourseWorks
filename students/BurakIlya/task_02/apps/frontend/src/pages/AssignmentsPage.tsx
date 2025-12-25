import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listRequests,
  listVolunteers
} from "../lib/api";
import type { Assignment, AssignmentStatus, HelpRequest, VolunteerProfile } from "../types";
import { useAuth } from "../contexts/AuthContext";

const createSchema = z.object({ requestId: z.string().uuid(), volunteerId: z.string().uuid().optional() });
const updateSchema = z.object({ status: z.enum(["assigned", "in_progress", "completed", "cancelled"]) });

type CreateForm = z.infer<typeof createSchema>;

type UpdateForm = z.infer<typeof updateSchema>;

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Assignment[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assign, reqs, vols] = await Promise.all([
        listAssignments(),
        listRequests({ status: "new" }),
        listVolunteers()
      ]);
      setItems(assign.items);
      setRequests(reqs.items);
      setVolunteers(vols.items);
      reset({ requestId: reqs.items[0]?.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить назначения");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (values: CreateForm) => {
    await createAssignment(values);
    await load();
  };

  const onUpdate = async (id: string, values: UpdateForm) => {
    await updateAssignment(id, values);
    await load();
  };

  const onDelete = async (id: string) => {
    await deleteAssignment(id);
    await load();
  };

  const statusOptions: AssignmentStatus[] = ["assigned", "in_progress", "completed", "cancelled"];

  return (
    <div className="card">
      <div className="item-header" style={{ marginBottom: 12 }}>
        <div>
          <h2>Назначения</h2>
          <p className="muted">Волонтёр может взять задачу себе; admin может назначать любого.</p>
        </div>
        <div className="badge">{items.length}</div>
      </div>
      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Загрузка...</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Отклик / назначение</h3>
        <form onSubmit={handleSubmit(onCreate)} className="inline-form">
          <select {...register("requestId")}> 
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          {isAdmin && (
            <select {...register("volunteerId")}>
              <option value="">(сам волонтёр)</option>
              {volunteers.map((v) => (
                <option key={v.id} value={v.userId}>
                  {v.user?.username ?? v.userId}
                </option>
              ))}
            </select>
          )}
          {errors.requestId && <span className="error">{errors.requestId.message}</span>}
          <button className="btn primary" type="submit">
            Назначить
          </button>
        </form>
        <p className="muted">Волонтёр без volunteerId назначает себя.</p>
      </div>

      <div className="list">
        {items.map((a) => {
          const canUpdate = isAdmin || a.volunteerId === user?.id || a.request?.userId === user?.id;
          const canDelete = isAdmin;
          return (
            <div key={a.id} className="item">
              <div className="item-header">
                <div>
                  <strong>{a.request?.title ?? a.requestId}</strong>
                  <div className="muted">Исполнитель: {a.volunteerId}</div>
                  <span className="status">{a.status}</span>
                </div>
                <div className="item-actions">
                  {canUpdate && (
                    <form
                      className="inline-form"
                      onSubmit={handleSubmitEdit((values) => onUpdate(a.id, values))}
                    >
                      <select defaultValue={a.status} {...registerEdit("status")}> 
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {editErrors.status && <span className="error">{editErrors.status.message}</span>}
                      <button className="btn" type="submit">
                        Обновить
                      </button>
                    </form>
                  )}
                  {canDelete && (
                    <button className="btn danger" onClick={() => onDelete(a.id)}>
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!items.length && !loading && <div className="muted">Назначений нет</div>}
      </div>
    </div>
  );
}
