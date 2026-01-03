import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Company } from '../types';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../api';

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const fetchCompanies = async () => {
    try {
      const { companies: data } = await getCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = () => {
    setEditingCompany(null);
    setShowModal(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить компанию?')) return;
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const handleSave = async (data: { name: string; website?: string }) => {
    try {
      if (editingCompany) {
        const { company } = await updateCompany(editingCompany.id, data);
        setCompanies((prev) => prev.map((c) => (c.id === company.id ? company : c)));
      } else {
        const { company } = await createCompany(data);
        setCompanies((prev) => [...prev, company]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Загрузка компаний...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏢 Компании</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          + Добавить компанию
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {companies.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет компаний.</p>
          <p>Добавьте компании, чтобы связать с ними вакансии.</p>
          <button onClick={handleCreate} className="btn btn-primary">
            Добавить компанию
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {companies.map((company) => (
            <div key={company.id} className="card">
              <div className="card-header">
                <h3>{company.name}</h3>
                <div className="card-actions">
                  <button
                    onClick={() => handleEdit(company)}
                    className="btn btn-icon"
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="btn btn-icon"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="company-link"
                >
                  {company.website}
                </a>
              )}
              <div className="card-footer">
                <Link to={`/jobs?companyId=${company.id}`} className="text-link">
                  Вакансии →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CompanyModal
          company={editingCompany}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

interface CompanyModalProps {
  company: Company | null;
  onSave: (data: { name: string; website?: string }) => void;
  onClose: () => void;
}

function CompanyModal({ company, onSave, onClose }: CompanyModalProps) {
  const [name, setName] = useState(company?.name || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onSave({ name: name.trim(), website: website.trim() || undefined });
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{company ? 'Редактировать компанию' : 'Новая компания'}</h2>
          <button onClick={onClose} className="btn btn-icon">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Название *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название компании"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="website">Сайт</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
