import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Job, Company } from '../types';
import { getJobs, getCompanies, createJob, deleteJob } from '../api';

export function JobsPage() {
  const [searchParams] = useSearchParams();
  const companyIdFilter = searchParams.get('companyId');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const [jobsRes, companiesRes] = await Promise.all([getJobs(), getCompanies()]);
      let filteredJobs = jobsRes.jobs;
      if (companyIdFilter) {
        filteredJobs = filteredJobs.filter((j) => j.companyId === companyIdFilter);
      }
      setJobs(filteredJobs);
      setCompanies(companiesRes.companies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyIdFilter]);

  const handleCreate = () => {
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить вакансию со всеми этапами и заметками?')) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const handleSave = async (data: {
    title: string;
    companyId?: string;
    salary?: string;
    url?: string;
  }) => {
    try {
      const { job } = await createJob(data);
      const jobWithCompany = {
        ...job,
        company: companies.find((c) => c.id === job.companyId),
      };
      setJobs((prev) => [...prev, jobWithCompany]);
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка создания');
    }
  };

  const getStatusColor = (job: Job) => {
    const stages = job.stages || [];
    if (stages.length === 0) return '#6b7280';
    const lastStage = stages[stages.length - 1];
    const name = lastStage.name.toLowerCase();
    if (name.includes('оффер') || name.includes('offer')) return '#10b981';
    if (name.includes('отказ') || name.includes('reject')) return '#ef4444';
    return '#3b82f6';
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Загрузка вакансий...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>💼 Вакансии</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          + Добавить вакансию
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {companyIdFilter && (
        <div className="filter-bar">
          <span>Фильтр по компании: {companies.find((c) => c.id === companyIdFilter)?.name}</span>
          <Link to="/jobs" className="btn btn-secondary btn-sm">
            Сбросить
          </Link>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет вакансий.</p>
          <p>Добавьте первую вакансию, чтобы начать отслеживать!</p>
          <button onClick={handleCreate} className="btn btn-primary">
            Добавить вакансию
          </button>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-status" style={{ backgroundColor: getStatusColor(job) }} />
              <div className="job-info">
                <Link to={`/jobs/${job.id}`} className="job-title">
                  {job.title}
                </Link>
                <p className="job-company">{job.company?.name || 'Компания не указана'}</p>
                {job.salary && <p className="job-salary">{job.salary}</p>}
                {job.stages && job.stages.length > 0 && (
                  <p className="job-stage">Этап: {job.stages[job.stages.length - 1].name}</p>
                )}
              </div>
              <div className="job-actions">
                <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm">
                  Открыть
                </Link>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="btn btn-icon"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <JobModal companies={companies} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

interface JobModalProps {
  companies: Company[];
  onSave: (data: { title: string; companyId?: string; salary?: string; url?: string }) => void;
  onClose: () => void;
}

function JobModal({ companies, onSave, onClose }: JobModalProps) {
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState<string>('');
  const [salary, setSalary] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onSave({
      title: title.trim(),
      companyId: companyId || undefined,
      salary: salary.trim() || undefined,
      url: url.trim() || undefined,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Новая вакансия</h2>
          <button onClick={onClose} className="btn btn-icon">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Название *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Frontend Developer"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="company">Компания</label>
            <select id="company" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">Не выбрано</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="salary">Зарплата</label>
            <input
              id="salary"
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="100 000 - 150 000 руб."
            />
          </div>
          <div className="form-group">
            <label htmlFor="url">Ссылка на вакансию</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hh.ru/vacancy/..."
            />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
