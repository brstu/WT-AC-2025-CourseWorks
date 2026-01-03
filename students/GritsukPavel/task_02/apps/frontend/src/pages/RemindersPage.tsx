import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Reminder } from '../types';
import { getReminders, deleteReminder } from '../api';

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const fetchReminders = async () => {
    try {
      const { reminders: data } = await getReminders({});
      setReminders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить напоминание?')) return;
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const now = new Date();
  const filteredReminders = reminders.filter((r) => {
    const date = new Date(r.remindAt);
    if (filter === 'upcoming') return date >= now;
    if (filter === 'past') return date < now;
    return true;
  });

  const sortedReminders = filteredReminders.sort(
    (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
  );

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Загрузка напоминаний...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>⏰ Напоминания</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({reminders.length})
        </button>
        <button
          className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Предстоящие ({reminders.filter((r) => new Date(r.remindAt) >= now).length})
        </button>
        <button
          className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Прошедшие ({reminders.filter((r) => new Date(r.remindAt) < now).length})
        </button>
      </div>

      {sortedReminders.length === 0 ? (
        <div className="empty-state">
          <p>
            {filter === 'all'
              ? 'У вас пока нет напоминаний.'
              : filter === 'upcoming'
                ? 'Нет предстоящих напоминаний.'
                : 'Нет прошедших напоминаний.'}
          </p>
          <p>Напоминания можно добавить на странице вакансии.</p>
          <Link to="/jobs" className="btn btn-primary">
            К вакансиям
          </Link>
        </div>
      ) : (
        <div className="reminders-page-list">
          {sortedReminders.map((reminder) => {
            const isPast = new Date(reminder.remindAt) < now;
            return (
              <div key={reminder.id} className={`reminder-card ${isPast ? 'past' : ''}`}>
                <div className="reminder-time">
                  <span className="reminder-date-large">
                    {new Date(reminder.remindAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="reminder-time-small">
                    {new Date(reminder.remindAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="reminder-details">
                  <p className="reminder-message">{reminder.message}</p>
                  {reminder.job && (
                    <Link to={`/jobs/${reminder.job.id}`} className="reminder-job-link">
                      📋 {reminder.job.title}
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="btn btn-icon"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
