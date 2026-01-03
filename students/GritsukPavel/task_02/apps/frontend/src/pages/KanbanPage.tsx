import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKanban, moveJobOnKanban, type KanbanColumn } from '../api';

interface KanbanJob {
  id: string;
  title: string;
  companyId: string | null;
  companyName: string | null;
  salary: string | null;
  url: string | null;
  updatedAt: string;
}

export function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedJob, setDraggedJob] = useState<KanbanJob | null>(null);
  const [dragSourceColumn, setDragSourceColumn] = useState<string | null>(null);

  const fetchKanban = async () => {
    try {
      setError('');
      const response = await getKanban();
      setColumns(response?.columns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  const handleDragStart = (job: KanbanJob, columnId: string) => {
    setDraggedJob(job);
    setDragSourceColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (targetColumnId: string) => {
    if (!draggedJob || !dragSourceColumn) return;

    // Не перемещаем в ту же колонку
    if (dragSourceColumn === targetColumnId) {
      setDraggedJob(null);
      setDragSourceColumn(null);
      return;
    }

    // Optimistic update
    const newColumns = columns.map((col) => {
      if (col.id === dragSourceColumn) {
        return { ...col, jobs: col.jobs.filter((j) => j.id !== draggedJob.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, jobs: [...col.jobs, draggedJob] };
      }
      return col;
    });
    setColumns(newColumns);

    // Сохраняем изменение на сервере
    try {
      await moveJobOnKanban(draggedJob.id, targetColumnId);
    } catch (err) {
      // Rollback on error
      console.error('Failed to move job:', err);
      setError('Не удалось переместить вакансию');
      await fetchKanban(); // Reload from server
    }

    setDraggedJob(null);
    setDragSourceColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedJob(null);
    setDragSourceColumn(null);
  };

  const totalJobs = columns.reduce((sum, col) => sum + col.jobs.length, 0);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Загрузка канбан-доски...</p>
      </div>
    );
  }

  if (error && columns.length === 0) {
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
        <Link to="/jobs" className="btn btn-primary">
          + Добавить вакансию
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {totalJobs === 0 ? (
        <div className="empty-state">
          <h2>У вас пока нет вакансий</h2>
          <p>Создайте первую вакансию, чтобы начать отслеживать отклики!</p>
          <Link to="/jobs" className="btn btn-primary">
            Перейти к вакансиям
          </Link>
        </div>
      ) : (
        <div className="kanban-board">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`kanban-column ${dragSourceColumn && dragSourceColumn !== column.id ? 'drop-target' : ''}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.name}</h3>
                <span className="job-count">{column.jobs.length}</span>
              </div>
              <div className="kanban-column-body">
                {column.jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`kanban-card ${draggedJob?.id === job.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(job, column.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <Link to={`/jobs/${job.id}`} className="kanban-card-link">
                      <h4>{job.title}</h4>
                      <p className="company-name">{job.companyName || 'Без компании'}</p>
                      {job.salary && <p className="salary">💰 {job.salary}</p>}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="kanban-legend">
        <p>💡 Перетащите вакансию в другую колонку, чтобы изменить её статус</p>
      </div>
    </div>
  );
}
