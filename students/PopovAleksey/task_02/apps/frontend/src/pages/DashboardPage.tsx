import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import type { Booking, Room } from "../types";

export function DashboardPage() {
  const api = useApi();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [roomsRes, bookingsRes] = await Promise.all([
          api.rooms.list(),
          api.bookings.list({ limit: 5 })
        ]);
        setRooms(roomsRes.data);
        setBookings(bookingsRes.data);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  return (
    <div>
      <div className="space-between" style={{ marginBottom: 12 }}>
        <div>
          <h2>Добро пожаловать, {user?.username}</h2>
          <p className="muted">Быстрый обзор аудиторий и ваших ближайших бронирований.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="card-grid">
          <div className="card">
            <h3>Аудитории</h3>
            <p className="muted">Доступно: {rooms.length}</p>
          </div>
          <div className="card">
            <h3>Бронирования</h3>
            <p className="muted">Всего: {bookings.length}</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Ближайшие бронирования</h3>
        {bookings.length === 0 ? (
          <p className="muted">Нет активных бронирований</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Аудитория</th>
                <th>Начало</th>
                <th>Конец</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.room?.name || b.roomId}</td>
                  <td>{new Date(b.startTime).toLocaleString()}</td>
                  <td>{new Date(b.endTime).toLocaleString()}</td>
                  <td><span className="badge info">{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
