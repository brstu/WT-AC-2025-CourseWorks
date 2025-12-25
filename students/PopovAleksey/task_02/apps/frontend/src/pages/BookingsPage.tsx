import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import type { Booking, Room } from "../types";

const createSchema = z.object({
  roomId: z.string().uuid({ message: "Выберите аудиторию" }),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  purpose: z.string().min(1, "Укажите цель"),
});

const updateSchema = z.object({
  startTime: z.string().min(1),
  endTime: z.string().min(1)
});

export function BookingsPage() {
  const api = useApi();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { roomId: "", startTime: "", endTime: "", purpose: "" }
  });

  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: { startTime: "", endTime: "" }
  });

  const load = useMemo(
    () => async () => {
      try {
        setLoading(true);
        setError(null);
        const [roomsRes, bookingsRes] = await Promise.all([
          api.rooms.list(),
          api.bookings.list({ limit: 50 })
        ]);
        setRooms(roomsRes.data);
        setBookings(bookingsRes.data);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить бронирования");
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (data: z.infer<typeof createSchema>) => {
    try {
      setError(null);
      await api.bookings.create({
        roomId: data.roomId,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        purpose: data.purpose
      });
      createForm.reset();
      load();
    } catch (err: any) {
      setError(err.message || "Не удалось создать бронирование");
    }
  };

  const onUpdate = async (data: z.infer<typeof updateSchema>) => {
    if (!editing) return;
    try {
      await api.bookings.update(editing.id, {
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString()
      });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.message || "Не удалось обновить бронирование");
    }
  };

  const cancel = async (booking: Booking) => {
    try {
      await api.bookings.cancel(booking.id);
      load();
    } catch (err: any) {
      setError(err.message || "Не удалось отменить");
    }
  };

  const canModify = (booking: Booking) => isAdmin || booking.userId === user?.id;

  return (
    <div>
      <div className="space-between">
        <div>
          <h2>Бронирования</h2>
          <p className="muted">Создание, перенос и отмена слотов</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Аудитория</th>
              <th>Начало</th>
              <th>Конец</th>
              <th>Цель</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{rooms.find((r) => r.id === b.roomId)?.name || b.roomId}</td>
                <td>{new Date(b.startTime).toLocaleString()}</td>
                <td>{new Date(b.endTime).toLocaleString()}</td>
                <td>{b.purpose}</td>
                <td><span className="badge info">{b.status}</span></td>
                <td className="flex" style={{ gap: 6 }}>
                  {canModify(b) && b.status === "active" && (
                    <>
                      <button className="btn secondary" onClick={() => {
                        setEditing(b);
                        updateForm.reset({
                          startTime: new Date(b.startTime).toISOString().slice(0, 16),
                          endTime: new Date(b.endTime).toISOString().slice(0, 16)
                        });
                      }}>Перенести</button>
                      <button className="btn danger" onClick={() => cancel(b)}>Отменить</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>Новое бронирование</h3>
        <form className="form" onSubmit={createForm.handleSubmit(onCreate)}>
          <div className="field">
            <label>Аудитория</label>
            <select {...createForm.register("roomId")}> 
              <option value="">Выберите</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name} · {r.location}</option>
              ))}
            </select>
            {createForm.formState.errors.roomId && <span className="error">{createForm.formState.errors.roomId.message}</span>}
          </div>
          <div className="field">
            <label>Начало</label>
            <input type="datetime-local" {...createForm.register("startTime")}/>
          </div>
          <div className="field">
            <label>Конец</label>
            <input type="datetime-local" {...createForm.register("endTime")}/>
          </div>
          <div className="field">
            <label>Цель</label>
            <input {...createForm.register("purpose")}/>
          </div>
          <button className="btn primary" type="submit" disabled={createForm.formState.isSubmitting}>Забронировать</button>
        </form>
      </div>

      {editing && (
        <div style={{ marginTop: 20 }}>
          <h3>Перенос бронирования</h3>
          <form className="form" onSubmit={updateForm.handleSubmit(onUpdate)}>
            <div className="field">
              <label>Начало</label>
              <input type="datetime-local" {...updateForm.register("startTime")}/>
            </div>
            <div className="field">
              <label>Конец</label>
              <input type="datetime-local" {...updateForm.register("endTime")}/>
            </div>
            <div className="flex">
              <button className="btn primary" type="submit" disabled={updateForm.formState.isSubmitting}>Сохранить</button>
              <button className="btn secondary" type="button" onClick={() => setEditing(null)}>Отмена</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
