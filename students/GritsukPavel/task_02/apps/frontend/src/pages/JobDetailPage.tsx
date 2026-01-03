import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Job, Stage, Note, Reminder } from '../types';
import {
  getJob,
  updateJob,
  deleteJob,
  getStages,
  createStage,
  updateStage,
  deleteStage,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getReminders,
  createReminder,
  deleteReminder,
} from '../api';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = id!;

  const [job, setJob] = useState<Job | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingJob, setEditingJob] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newReminder, setNewReminder] = useState({ text: '', date: '' });

  const fetchData = async () => {
    try {
      const [jobRes, stagesRes, notesRes, remindersRes] = await Promise.all([
        getJob(jobId),
        getStages(jobId),
        getNotes(jobId),
        getReminders({ jobId }),
      ]);
      setJob(jobRes.job);
      setStages(stagesRes.stages);
      setNotes(notesRes.notes);
      setReminders(remindersRes.reminders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const handleDeleteJob = async () => {
    if (!confirm('Удалить вакансию со всеми этапами, заметками и напоминаниями?')) return;
    try {
      await deleteJob(jobId);
      navigate('/jobs');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const handleUpdateJob = async (data: { title?: string; salary?: string; url?: string }) => {
    try {
      const { job: updated } = await updateJob(jobId, data);
      setJob(updated);
      setEditingJob(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка обновления');
    }
  };

  // Stage handlers
  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStage.trim()) return;
    try {
      const { stage } = await createStage(jobId, { name: newStage.trim() });
      setStages((prev) => [...prev, stage]);
      setNewStage('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка добавления этапа');
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Удалить этап?')) return;
    try {
      await deleteStage(stageId);
      setStages((prev) => prev.filter((s) => s.id !== stageId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  // Note handlers
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const { note } = await createNote(jobId, { content: newNote.trim() });
      setNotes((prev) => [...prev, note]);
      setNewNote('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка добавления заметки');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  // Reminder handlers
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.text.trim() || !newReminder.date) return;
    try {
      const { reminder } = await createReminder({
        jobId,
        message: newReminder.text.trim(),
        remindAt: new Date(newReminder.date).toISOString(),
      });
      setReminders((prev) => [...prev, reminder]);
      setNewReminder({ text: '', date: '' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка добавления напоминания');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await deleteReminder(reminderId);
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Загрузка вакансии...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="error-screen">
        <p>{error || 'Вакансия не найдена'}</p>
        <Link to="/jobs" className="btn btn-primary">
          К списку вакансий
        </Link>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="page-header">
        <Link to="/jobs" className="back-link">
          ← Назад к вакансиям
        </Link>
      </div>

      {/* Job Info */}
      <div className="job-detail-card">
        {editingJob ? (
          <JobEditForm job={job} onSave={handleUpdateJob} onCancel={() => setEditingJob(false)} />
        ) : (
          <>
            <div className="job-detail-header">
              <div>
                <h1>{job.title}</h1>
                {job.company && <p className="company-name">{job.company.name}</p>}
              </div>
              <div className="job-detail-actions">
                <button onClick={() => setEditingJob(true)} className="btn btn-secondary">
                  ✏️ Редактировать
                </button>
                <button onClick={handleDeleteJob} className="btn btn-danger">
                  🗑️ Удалить
                </button>
              </div>
            </div>
            <div className="job-detail-info">
              {job.salary && (
                <p>
                  <strong>Зарплата:</strong> {job.salary}
                </p>
              )}
              {job.url && (
                <p>
                  <strong>Ссылка:</strong>{' '}
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    {job.url}
                  </a>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="job-detail-sections">
        {/* Stages */}
        <section className="detail-section">
          <h2>📊 Этапы ({stages.length})</h2>
          <div className="stages-timeline">
            {stages.map((stage, index) => (
              <div key={stage.id} className="stage-item">
                <div className="stage-number">{index + 1}</div>
                <div className="stage-content">
                  <h4>{stage.name}</h4>
                  <span className="stage-date">
                    {new Date(stage.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteStage(stage.id)}
                  className="btn btn-icon btn-sm"
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddStage} className="add-form">
            <input
              type="text"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              placeholder="Название этапа (например: HR-скрининг)"
            />
            <button type="submit" className="btn btn-primary" disabled={!newStage.trim()}>
              Добавить
            </button>
          </form>
        </section>

        {/* Notes */}
        <section className="detail-section">
          <h2>📝 Заметки ({notes.length})</h2>
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-item">
                <p>{note.content}</p>
                <div className="note-footer">
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="btn btn-icon btn-sm"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddNote} className="add-form">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Добавить заметку..."
              rows={2}
            />
            <button type="submit" className="btn btn-primary" disabled={!newNote.trim()}>
              Добавить
            </button>
          </form>
        </section>

        {/* Reminders */}
        <section className="detail-section">
          <h2>⏰ Напоминания ({reminders.length})</h2>
          <div className="reminders-list">
            {reminders.map((reminder) => {
              const isPast = new Date(reminder.remindAt) < new Date();
              return (
                <div key={reminder.id} className={`reminder-item ${isPast ? 'past' : ''}`}>
                  <div className="reminder-content">
                    <p>{reminder.message}</p>
                    <span className="reminder-date">
                      {new Date(reminder.remindAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="btn btn-icon btn-sm"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleAddReminder} className="add-form reminder-form">
            <input
              type="text"
              value={newReminder.text}
              onChange={(e) => setNewReminder((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="Текст напоминания"
            />
            <input
              type="datetime-local"
              value={newReminder.date}
              onChange={(e) => setNewReminder((prev) => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newReminder.text.trim() || !newReminder.date}
            >
              Добавить
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

interface JobEditFormProps {
  job: Job;
  onSave: (data: { title?: string; salary?: string; url?: string }) => Promise<void>;
  onCancel: () => void;
}

function JobEditForm({ job, onSave, onCancel }: JobEditFormProps) {
  const [title, setTitle] = useState(job.title);
  const [salary, setSalary] = useState(job.salary || '');
  const [url, setUrl] = useState(job.url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onSave({
      title: title.trim(),
      salary: salary.trim() || undefined,
      url: url.trim() || undefined,
    });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="job-edit-form">
      <div className="form-group">
        <label htmlFor="title">Название</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="salary">Зарплата</label>
        <input id="salary" type="text" value={salary} onChange={(e) => setSalary(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="url">Ссылка</label>
        <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
