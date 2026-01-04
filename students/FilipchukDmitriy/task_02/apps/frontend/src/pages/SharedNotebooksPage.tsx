import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebooksApi } from '../api';
import type { Notebook } from '../types';
import {
  Button,
  Spinner,
  EmptyState,
  ErrorState,
} from '../components/ui';

export function SharedNotebooksPage() {
  const navigate = useNavigate();

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSharedNotebooks = async () => {
    setIsLoading(true);
    setError(null);
    const response = await notebooksApi.list({ shared: true });
    if (response.status === 'ok' && response.data) {
      setNotebooks(response.data);
    } else {
      setError(response.error || 'Не удалось загрузить тетради');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSharedNotebooks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadSharedNotebooks} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Доступные мне</h1>
          <p className="text-gray-500 mt-1">Тетради, которыми с вами поделились другие пользователи</p>
        </div>
      </div>

      {notebooks.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
          title="Нет доступных тетрадей"
          description="Когда кто-то поделится с вами тетрадью, она появится здесь"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/notebooks/${notebook.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">📓</div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Общий доступ
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{notebook.title}</h3>
              {notebook.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{notebook.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-3">
                {new Date(notebook.updatedAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
