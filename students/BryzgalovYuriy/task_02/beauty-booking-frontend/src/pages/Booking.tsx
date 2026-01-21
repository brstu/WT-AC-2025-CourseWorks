import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMasters, type Master, type Service } from '../api/masters';
import { getSlots, holdSlot, type Slot } from '../api/slots';
import { createBooking, rescheduleBooking } from '../api/bookings';
import { ApiError } from '../api/http';
import { Toast } from '../components/Toast';
import { getToken } from '../app/authStore';
import { Link } from 'react-router-dom';

function fmt(dtIso: string) {
  const d = new Date(dtIso);
  return d.toLocaleString();
}

function weekRangeUTC() {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function BookingPage() {
  const token = getToken();
  const [selectedMasterId, setSelectedMasterId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const { from, to } = useMemo(() => weekRangeUTC(), []);

  const mastersQ = useQuery({
    queryKey: ['masters'],
    queryFn: getMasters,
  });

  const masters = mastersQ.data?.items ?? [];
  const selectedMaster: Master | undefined = masters.find((m) => m._id === selectedMasterId);
  const services: Service[] = selectedMaster?.services ?? [];

  const slotsQ = useQuery({
    queryKey: ['slots', selectedMasterId, from, to],
    queryFn: () => getSlots(selectedMasterId, from, to),
    enabled: !!selectedMasterId,
  });

  const slots = slotsQ.data?.items ?? [];

  const canBook = !!selectedMasterId && !!selectedServiceId;

  const onPickMaster = (id: string) => {
    setSelectedMasterId(id);
    setSelectedServiceId('');
    setActiveBookingId(null);
  };

  const bookFlow = async (slot: Slot) => {
    if (!token) {
      setToast('Нужно войти (JWT).');
      return;
    }
    if (!canBook) {
      setToast('Выбери мастера и услугу.');
      return;
    }

    try {
      // 1) hold
      await holdSlot(slot._id, 10);

      // 2) create booking
      const bookingRes = await createBooking({ slotId: slot._id, serviceId: selectedServiceId });
      setActiveBookingId(bookingRes.item._id);

      // 3) "оплата" на фронте
      setToast('Запись создана. Оплата прошла успешно ✅');

      // обновить слоты
      await slotsQ.refetch();
    } catch (e) {
      if (e instanceof ApiError) setToast(e.message);
      else setToast('Ошибка бронирования');
    }
  };

  const rescheduleFlow = async (slot: Slot) => {
    if (!token) {
      setToast('Нужно войти (JWT).');
      return;
    }
    if (!activeBookingId) {
      setToast('Сначала создай бронь, чтобы переносить.');
      return;
    }

    try {
      await holdSlot(slot._id, 10);
      await rescheduleBooking(activeBookingId, slot._id);
      setToast('Перенос выполнен ✅');
      await slotsQ.refetch();
    } catch (e) {
      if (e instanceof ApiError) setToast(e.message);
      else setToast('Ошибка переноса');
    }
  };

  if (mastersQ.isLoading) return <div>Загрузка мастеров...</div>;
  if (mastersQ.isError) return <div>Ошибка загрузки мастеров</div>;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 900 }}>
      <h2>Бьюти-бронь «Запишите меня»</h2>

      {!token && (
        <div style={{ padding: 12, border: '1px solid #f5c2c2', background: '#fff1f1' }}>
          Ты не залогинен. <Link to="/login">Войти</Link>
        </div>
      )}

      <section style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
        <div style={{ fontWeight: 700 }}>1) Выбор мастера</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {masters.map((m) => (
            <button
              key={m._id}
              onClick={() => onPickMaster(m._id)}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: m._id === selectedMasterId ? '2px solid black' : '1px solid #ccc',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
        {selectedMaster?.bio && <div style={{ opacity: 0.8 }}>{selectedMaster.bio}</div>}
      </section>

      <section style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
        <div style={{ fontWeight: 700 }}>2) Выбор услуги</div>

        {!selectedMasterId ? (
          <div style={{ opacity: 0.7 }}>Сначала выбери мастера</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {services.map((s) => (
              <label
                key={s._id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="service"
                  value={s._id}
                  checked={selectedServiceId === s._id}
                  onChange={() => setSelectedServiceId(s._id)}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    {s.durationMin} мин · {s.price} BYN
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      <section style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
        <div style={{ fontWeight: 700 }}>3) Слоты (на 7 дней)</div>

        {!selectedMasterId ? (
          <div style={{ opacity: 0.7 }}>Выбери мастера, чтобы увидеть расписание</div>
        ) : slotsQ.isLoading ? (
          <div>Загрузка слотов...</div>
        ) : slotsQ.isError ? (
          <div>Ошибка загрузки слотов</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ opacity: 0.75 }}>Окно:</span>
              <code>{from}</code>
              <span style={{ opacity: 0.75 }}>→</span>
              <code>{to}</code>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {slots.length === 0 && <div>Слотов нет. Сгенерь на бэке /slots/generate.</div>}

              {slots.slice(0, 80).map((slot) => {
                const disabled = slot.status !== 'available';
                return (
                  <div
                    key={slot._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: 10,
                      border: '1px solid #eee',
                      borderRadius: 10,
                      background: disabled ? '#f7f7f7' : 'white',
                      opacity: disabled ? 0.7 : 1,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{fmt(slot.startAt)}</div>
                      <div style={{ fontSize: 13, opacity: 0.75 }}>
                        {new Date(slot.startAt).toLocaleTimeString()} – {new Date(slot.endAt).toLocaleTimeString()}
                        {' · '}status: <b>{slot.status}</b>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        disabled={!canBook || disabled}
                        onClick={() => bookFlow(slot)}
                        style={{ cursor: !canBook || disabled ? 'not-allowed' : 'pointer' }}
                      >
                        Записаться
                      </button>

                      <button
                        disabled={!activeBookingId || disabled}
                        onClick={() => rescheduleFlow(slot)}
                        style={{ cursor: !activeBookingId || disabled ? 'not-allowed' : 'pointer' }}
                      >
                        Перенести сюда
                      </button>
                    </div>
                  </div>
                );
              })}

              {slots.length > 80 && <div style={{ opacity: 0.7 }}>Показаны первые 80 слотов.</div>}
            </div>

            {activeBookingId && (
              <div style={{ padding: 10, border: '1px solid #cfe8cf', background: '#f1fff1', borderRadius: 10 }}>
                Активная бронь: <code>{activeBookingId}</code>
                <div style={{ opacity: 0.75, fontSize: 13 }}>
                  Теперь можешь выбрать другой available слот и нажать «Перенести сюда».
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {toast && <Toast text={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
