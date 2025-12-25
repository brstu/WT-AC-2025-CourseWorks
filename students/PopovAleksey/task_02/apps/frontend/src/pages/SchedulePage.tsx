import { useEffect, useMemo, useState } from "react";
import { useApi } from "../hooks/useApi";
import type { Booking, Room } from "../types";

export function SchedulePage() {
  const api = useApi();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useMemo(
    () => async () => {
      const res = await api.rooms.list();
      setRooms(res.data);
      if (res.data[0]) setRoomId(res.data[0].id);
    },
    [api]
  );

  useEffect(() => {
    loadRooms().catch(() => {});
  }, [loadRooms]);

  const loadSchedule = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.schedule.byRoom({ roomId, date: date || undefined });
      setBookings(res.data);
    } catch (err: any) {
      setError(err.message || "Не удалось загрузить расписание");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, date]);

  return (
    <div>
      <div className="space-between">
        <div>
          <h2>Расписание</h2>
          <p className="muted">Показывает все активные слоты по аудитории</p>
        </div>
      </div>

      <div className="flex" style={{ marginTop: 12 }}>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name} · {r.location}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <div className="alert" style={{ marginTop: 12 }}>{error}</div>}
      {loading ? (
        <div style={{ marginTop: 12 }}>Загрузка...</div>
      ) : (
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Начало</th>
              <th>Конец</th>
              <th>Цель</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">Слотов нет</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id}>
                  <td>{new Date(b.startTime).toLocaleString()}</td>
                  <td>{new Date(b.endTime).toLocaleString()}</td>
                  <td>{b.purpose}</td>
                  <td><span className="badge info">{b.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
