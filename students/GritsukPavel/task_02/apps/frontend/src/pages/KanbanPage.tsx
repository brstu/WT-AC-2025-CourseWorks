import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { KanbanStage, Job } from '../types';
import { getKanban } from '../api';

export function KanbanPage() {
  const [kanban, setKanban] = useState<KanbanStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);

  const fetchKanban = async () => {
    try {
      const { kanban: data } = await getKanban();
      setKanban(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  const handleDragStart = (job: Job) => {
    setDraggedJob(job);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStage: KanbanStage) => {
    if (!draggedJob) return;

    const sourceStage = kanban.find((s) => s.jobs.some((j) => j.id === draggedJob.id));
    if (!sourceStage || sourceStage.id === targetStage.id) {
      setDraggedJob(null);
      return;
    }

    // Optimistic update
    const newKanban = kanban.map((stage) => {
      if (stage.id === sourceStage.id) {
        return { ...stage, jobs: stage.jobs.filter((j) => j.id !== draggedJob.id) };
      }
      if (stage.id === targetStage.id) {
        return { ...stage, jobs: [...stage.jobs, draggedJob] };
      }
      return stage;
    });
    setKanban(newKanban);

    // Note: Full drag-and-drop requires backend endpoint to move job between stages
    // For MVP, just show the visual change
    setDraggedJob(null);
  };

  const getStageColor = (name: string) => {
    const lowName = name.toLowerCase();
    if (lowName.includes('отклик') || lowName.includes('applied')) return '#3b82f6';
    if (lowName.includes('hr') || lowName.includes('скрин')) return '#8b5cf6';
    if (lowName.includes('техн') || lowName.includes('tech')) return '#f59e0b';
    if (lowName.includes('оффер') || lowName.includes('offer')) return '#10b981';
    if (lowName.includes('отказ') || lowName.includes('reject')) return '#ef4444';
    return '#6b7280';
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Загрузка канбан-доски...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p>{error}</p>
        <button onClick={fetchKanban} className="btn btn-primary">
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="kanban-page">
      <div className="page-header">
        <h1>📋 Канбан-доска</h1>
        <Link to="/jobs/new" className="btn btn-primary">
          + Новая вакансия
        </Link>
      </div>

      {kanban.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет вакансий.</p>
          <p>Добавьте первую вакансию, чтобы начать отслеживать отклики!</p>
          <Link to="/jobs/new" className="btn btn-primary">
            Добавить вакансию
          </Link>
        </div>
      ) : (
        <div className="kanban-board">
          {kanban.map((stage) => (
            <div
              key={stage.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage)}
            >
              <div
                className="kanban-column-header"
                style={{ borderTopColor: getStageColor(stage.name) }}
              >
                <h3>{stage.name}</h3>
                <span className="job-count">{stage.jobs.length}</span>
              </div>
              <div className="kanban-column-body">
                {stage.jobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="kanban-card"
                    draggable
                    onDragStart={() => handleDragStart(job)}
                  >
                    <h4>{job.title}</h4>
                    <p className="company-name">{job.company?.name || 'Без компании'}</p>
                    {job.salary && <p className="salary">{job.salary}</p>}
                    {job.notes && job.notes.length > 0 && (
                      <span className="note-indicator" title={`${job.notes.length} заметок`}>
                        📝 {job.notes.length}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
