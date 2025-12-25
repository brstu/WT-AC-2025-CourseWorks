import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import type { Room } from "../types";

const schema = z.object({
  name: z.string().min(1, "Укажите название"),
  description: z.string().optional(),
  capacity: z.coerce.number().int().positive(),
  equipment: z.string().optional(),
  location: z.string().min(1)
});

export function RoomsPage() {
  const api = useApi();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", capacity: 10, location: "", description: "", equipment: "" }
  });

  const load = useMemo(
    () => async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.rooms.list();
        setRooms(res.data);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить аудитории");
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setError(null);
      if (editingId) {
        await api.rooms.update(editingId, data);
      } else {
        await api.rooms.create(data as Room & { id: string });
      }
      reset({ name: "", capacity: 10, location: "", description: "", equipment: "" });
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    }
  };

  const startEdit = (room: Room) => {
    setEditingId(room.id);
    reset({
      name: room.name,
      description: room.description || "",
      capacity: room.capacity,
      equipment: room.equipment || "",
      location: room.location
    });
  };

  const removeRoom = async (id: string) => {
    try {
      await api.rooms.remove(id);
      load();
    } catch (err: any) {
      setError(err.message || "Не удалось удалить");
    }
  };

  return (
    <div>
      <div className="space-between">
        <div>
          <h2>Аудитории</h2>
          <p className="muted">Просмотр и управление аудиториями</p>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Вместимость</th>
              <th>Оборудование</th>
              <th>Локация</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{room.capacity}</td>
                <td>{room.equipment || "—"}</td>
                <td>{room.location}</td>
                {isAdmin && (
                  <td className="flex" style={{ gap: 6 }}>
                    <button className="btn secondary" onClick={() => startEdit(room)}>Править</button>
                    <button className="btn danger" onClick={() => removeRoom(room.id)}>Удалить</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isAdmin && (
        <div style={{ marginTop: 20 }}>
          <h3>{editingId ? "Редактировать аудиторию" : "Добавить аудиторию"}</h3>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <div className="field">
              <label>Название</label>
              <input {...register("name")}/>
              {formState.errors.name && <span className="error">{formState.errors.name.message}</span>}
            </div>
            <div className="field">
              <label>Вместимость</label>
              <input type="number" {...register("capacity", { valueAsNumber: true })}/>
              {formState.errors.capacity && <span className="error">{formState.errors.capacity.message}</span>}
            </div>
            <div className="field">
              <label>Оборудование</label>
              <input {...register("equipment")}/>
            </div>
            <div className="field">
              <label>Локация</label>
              <input {...register("location")}/>
              {formState.errors.location && <span className="error">{formState.errors.location.message}</span>}
            </div>
            <div className="field">
              <label>Описание</label>
              <textarea rows={3} {...register("description")}/>
            </div>
            <div className="flex">
              <button className="btn primary" type="submit" disabled={formState.isSubmitting}>
                {editingId ? "Сохранить" : "Создать"}
              </button>
              {editingId && (
                <button className="btn secondary" type="button" onClick={() => { setEditingId(null); reset(); }}>
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {!isAdmin && <p className="muted" style={{ marginTop: 12 }}>Редактирование аудиторий доступно только админу.</p>}
    </div>
  );
}
