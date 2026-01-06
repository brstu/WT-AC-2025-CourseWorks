import React, { useState, useEffect, useCallback } from 'react';
import { reportsApi, extractError } from '../api';
import { DailyReport, WeeklyReport, MonthlyReport, TagReport } from '../types';
import { LoadingSpinner, ErrorMessage, useToast } from '../components';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'byTag';

function formatDate(date: Date): string {
  return date.toISOString();
}

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  return `${mins}м`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getMonthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function ReportsPage() {
  const { showToast } = useToast();
  
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Параметры
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(getMonthStr(new Date()));
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [dateTo, setDateTo] = useState(new Date());
  
  // Данные
  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReport | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyReport | null>(null);
  const [tagData, setTagData] = useState<TagReport[]>([]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (reportType) {
        case 'daily': {
          const data = await reportsApi.daily(formatDate(selectedDate));
          setDailyData(data);
          break;
        }
        case 'weekly': {
          const data = await reportsApi.weekly(formatDate(selectedWeek));
          setWeeklyData(data);
          break;
        }
        case 'monthly': {
          const data = await reportsApi.monthly(selectedMonth);
          setMonthlyData(data);
          break;
        }
        case 'byTag': {
          const data = await reportsApi.byTag(formatDate(dateFrom), formatDate(dateTo));
          setTagData(data);
          break;
        }
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [reportType, selectedDate, selectedWeek, selectedMonth, dateFrom, dateTo]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await reportsApi.exportData(
        formatDate(dateFrom),
        formatDate(dateTo),
        format
      );
      
      if (format === 'csv') {
        const blob = new Blob([data as string], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      showToast('success', 'Отчёт экспортирован');
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  const renderDailyReport = () => {
    if (!dailyData) return null;
    
    return (
      <div className="report-content">
        <div className="report-header">
          <h2>📅 Отчёт за {formatDateForDisplay(dailyData.date)}</h2>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🍅</span>
            <div className="stat-info">
              <span className="stat-value">{dailyData.completedSessions}</span>
              <span className="stat-label">Завершённых сессий</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <div className="stat-info">
              <span className="stat-value">{formatMinutes(dailyData.totalMinutes)}</span>
              <span className="stat-label">Всего времени</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <span className="stat-value">{dailyData.totalSessions}</span>
              <span className="stat-label">Всего сессий</span>
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <h3>По типам сессий</h3>
          <div className="session-types-stats">
            <div className="session-type-stat">
              <span className="type-label">🍅 Помодоро:</span>
              <span className="type-value">{dailyData.byType.pomodoro}</span>
            </div>
            <div className="session-type-stat">
              <span className="type-label">☕ Короткий перерыв:</span>
              <span className="type-value">{dailyData.byType.short_break}</span>
            </div>
            <div className="session-type-stat">
              <span className="type-label">🛋️ Длинный перерыв:</span>
              <span className="type-value">{dailyData.byType.long_break}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyReport = () => {
    if (!weeklyData) return null;
    
    return (
      <div className="report-content">
        <div className="report-header">
          <h2>📆 Недельный отчёт</h2>
          <input
            type="date"
            value={selectedWeek.toISOString().split('T')[0]}
            onChange={(e) => setSelectedWeek(getWeekStart(new Date(e.target.value)))}
          />
        </div>
        
        <p className="report-period">
          {formatDateForDisplay(weeklyData.weekStart)} — {formatDateForDisplay(weeklyData.weekEnd)}
        </p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🍅</span>
            <div className="stat-info">
              <span className="stat-value">{weeklyData.totals.completedSessions}</span>
              <span className="stat-label">Завершённых сессий</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <div className="stat-info">
              <span className="stat-value">{formatMinutes(weeklyData.totals.totalMinutes)}</span>
              <span className="stat-label">Всего времени</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <span className="stat-value">{weeklyData.totals.totalSessions}</span>
              <span className="stat-label">Всего сессий</span>
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <h3>По дням</h3>
          <div className="days-chart">
            {weeklyData.days.map((day) => (
              <div key={day.date} className="day-bar">
                <div
                  className="bar-fill"
                  style={{
                    height: `${Math.min(100, (day.totalMinutes / 240) * 100)}%`,
                  }}
                  title={`${formatMinutes(day.totalMinutes)}`}
                />
                <span className="day-label">
                  {new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    if (!monthlyData) return null;
    
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const [year, month] = monthlyData.month.split('-');
    const monthName = monthNames[parseInt(month) - 1];
    
    return (
      <div className="report-content">
        <div className="report-header">
          <h2>📅 {monthName} {year}</h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🍅</span>
            <div className="stat-info">
              <span className="stat-value">{monthlyData.completedSessions}</span>
              <span className="stat-label">Завершённых сессий</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <div className="stat-info">
              <span className="stat-value">{formatMinutes(monthlyData.totalMinutes)}</span>
              <span className="stat-label">Всего времени</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <span className="stat-value">{monthlyData.totalSessions}</span>
              <span className="stat-label">Всего сессий</span>
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <h3>По неделям</h3>
          <div className="weeks-list">
            {monthlyData.byWeek.map((week) => (
              <div key={week.week} className="week-row">
                <span className="week-label">Неделя {week.week}</span>
                <div className="week-bar-container">
                  <div
                    className="week-bar"
                    style={{
                      width: `${Math.min(100, (week.totalMinutes / 600) * 100)}%`,
                    }}
                  />
                </div>
                <span className="week-value">{formatMinutes(week.totalMinutes)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTagReport = () => {
    return (
      <div className="report-content">
        <div className="report-header">
          <h2>🏷️ Статистика по тегам</h2>
          <div className="date-range-picker">
            <input
              type="date"
              value={dateFrom.toISOString().split('T')[0]}
              onChange={(e) => setDateFrom(new Date(e.target.value))}
            />
            <span>—</span>
            <input
              type="date"
              value={dateTo.toISOString().split('T')[0]}
              onChange={(e) => setDateTo(new Date(e.target.value))}
            />
          </div>
        </div>
        
        {tagData.length === 0 ? (
          <div className="empty-report">
            <p>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="tags-stats">
            {tagData.map((tag) => (
              <div key={tag.tagId} className="tag-stat-row">
                <div className="tag-info">
                  <span
                    className="tag-color-dot"
                    style={{ backgroundColor: tag.tagColor || '#6b7280' }}
                  />
                  <span className="tag-name">{tag.tagName}</span>
                </div>
                <div className="tag-stats">
                  <span className="tag-sessions">{tag.totalSessions} сессий</span>
                  <span className="tag-time">{formatMinutes(tag.totalMinutes)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="export-section">
          <h3>Экспорт данных</h3>
          <p>Экспортировать все сессии за выбранный период:</p>
          <div className="export-buttons">
            <button className="btn btn-outline" onClick={() => handleExport('csv')}>
              📄 Экспорт CSV
            </button>
            <button className="btn btn-outline" onClick={() => handleExport('json')}>
              📋 Экспорт JSON
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>📊 Статистика</h1>
      </div>
      
      <div className="report-tabs">
        <button
          className={`tab-btn ${reportType === 'daily' ? 'active' : ''}`}
          onClick={() => setReportType('daily')}
        >
          📅 День
        </button>
        <button
          className={`tab-btn ${reportType === 'weekly' ? 'active' : ''}`}
          onClick={() => setReportType('weekly')}
        >
          📆 Неделя
        </button>
        <button
          className={`tab-btn ${reportType === 'monthly' ? 'active' : ''}`}
          onClick={() => setReportType('monthly')}
        >
          🗓️ Месяц
        </button>
        <button
          className={`tab-btn ${reportType === 'byTag' ? 'active' : ''}`}
          onClick={() => setReportType('byTag')}
        >
          🏷️ По тегам
        </button>
      </div>
      
      {loading ? (
        <LoadingSpinner text="Загрузка отчёта..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadReport} />
      ) : (
        <>
          {reportType === 'daily' && renderDailyReport()}
          {reportType === 'weekly' && renderWeeklyReport()}
          {reportType === 'monthly' && renderMonthlyReport()}
          {reportType === 'byTag' && renderTagReport()}
        </>
      )}
    </div>
  );
}
