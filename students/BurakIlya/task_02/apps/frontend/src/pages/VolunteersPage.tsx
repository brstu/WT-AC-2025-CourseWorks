import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { listVolunteers, createVolunteer, updateVolunteer, deleteVolunteer } from "../lib/api";
import type { VolunteerProfile } from "../types";
import { useAuth } from "../contexts/AuthContext";

const schema = z.object({
  bio: z.string().max(2000).optional(),
  locationLat: z.coerce.number().optional(),
  locationLng: z.coerce.number().optional()
});

export default function VolunteersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<{ bio?: string; locationLat?: number; locationLng?: number }>({ resolver: zodResolver(schema) });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors }
  } = useForm<{ bio?: string; locationLat?: number; locationLng?: number }>({ resolver: zodResolver(schema) });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await listVolunteers();
      setItems(resp.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить волонтёров");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasProfile = useMemo(() => items.some((v) => v.userId === user?.id), [items, user?.id]);

  const onCreate = async (values: { bio?: string; locationLat?: number; locationLng?: number }) => {
    await createVolunteer(values);
    reset({ bio: "", locationLat: undefined, locationLng: undefined });
    await load();
  };

  const onEdit = async (values: { bio?: string; locationLat?: number; locationLng?: number }) => {
    if (!editId) return;
    await updateVolunteer(editId, values);
    setEditId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    await deleteVolunteer(id);
    await load();
  };

  return (
    <div className="card">
      <div className="item-header" style={{ marginBottom: 12 }}>
        <div>
          <h2>Волонтёры</h2>
          <p className="muted">User может создать себе профиль. Admin может редактировать любого.</p>
        </div>
        <div className="badge">{items.length}</div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Загрузка...</div>}

      {!hasProfile && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Стать волонтёром</h3>
          <form onSubmit={handleSubmit(onCreate)}>
            <label>
              О себе
              <textarea placeholder="Коротко о вас" {...register("bio")} />
              {errors.bio && <span className="error">{errors.bio.message}</span>}
            </label>
            <div className="flex-row">
              <input placeholder="Lat" {...register("locationLat")} />
              <input placeholder="Lng" {...register("locationLng")} />
            </div>
            <button className="btn primary" type="submit">
              Создать профиль
            </button>
          </form>
        </div>
      )}

      <div className="list">
        {items.map((v) => {
          const isOwner = v.userId === user?.id;
          const isAdmin = user?.role === "admin";
          const canManage = isOwner || isAdmin;
          return (
            <div key={v.id} className="item">
              <div className="item-header">
                <div>
                  <strong>{v.user?.username ?? v.userId}</strong>
                  <div className="muted">{v.user?.email}</div>
                  <div className="flex-row">
                    <span className="badge">rating {v.rating.toFixed(1)}</span>
                    <span className="badge">helps {v.totalHelps}</span>
                  </div>
                  {v.bio && <div className="muted">{v.bio}</div>}
                </div>
                {canManage && (
                  <div className="item-actions">
                    <button className="btn" onClick={() => { setEditId(v.id); resetEdit({ bio: v.bio ?? "", locationLat: v.locationLat ?? undefined, locationLng: v.locationLng ?? undefined }); }}>
                      Редактировать
                    </button>
                    <button className="btn danger" onClick={() => onDelete(v.id)}>
                      Удалить
                    </button>
                  </div>
                )}
              </div>
              {editId === v.id && (
                <form className="inline-form" onSubmit={handleSubmitEdit(onEdit)} style={{ marginTop: 10 }}>
                  <input placeholder="Био" {...registerEdit("bio")} />
                  <input placeholder="Lat" {...registerEdit("locationLat")} />
                  <input placeholder="Lng" {...registerEdit("locationLng")} />
                  {editErrors.bio && <span className="error">{editErrors.bio.message}</span>}
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
        {!items.length && !loading && <div className="muted">Профилей пока нет</div>}
      </div>
    </div>
  );
}
