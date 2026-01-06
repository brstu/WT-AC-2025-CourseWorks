import React, { useState, useEffect, useCallback } from 'react';
import { settingsApi, extractError } from '../api';
import { NotificationSettings } from '../types';
import { LoadingSpinner, ErrorMessage, useToast } from '../components';

export function SettingsPage() {
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.getNotifications();
      setSettings(data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    
    const oldValue = settings[key];
    
    // Оптимистичное обновление
    setSettings({ ...settings, [key]: value });
    
    try {
      setSaving(true);
      const updated = await settingsApi.updateNotifications({ [key]: value });
      setSettings(updated);
      showToast('success', 'Настройки сохранены');
    } catch (err) {
      // Откат при ошибке
      setSettings({ ...settings, [key]: oldValue });
      showToast('error', extractError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка настроек..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadSettings} />;
  }

  if (!settings) return null;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>⚙️ Настройки</h1>
      </div>

      <div className="settings-section">
        <h2>🔔 Уведомления</h2>
        <p className="section-description">
          Настройте, как приложение будет уведомлять вас о завершении сессий
        </p>

        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">📱</span>
              <div className="setting-text">
                <h3>Push-уведомления</h3>
                <p>Получать уведомления в браузере</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifyPush}
                onChange={(e) => handleToggle('notifyPush', e.target.checked)}
                disabled={saving}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🔊</span>
              <div className="setting-text">
                <h3>Звуковые уведомления</h3>
                <p>Воспроизводить звук при завершении таймера</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifySound}
                onChange={(e) => handleToggle('notifySound', e.target.checked)}
                disabled={saving}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">📧</span>
              <div className="setting-text">
                <h3>Email-уведомления</h3>
                <p>Получать сводку на email (в разработке)</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifyEmail}
                onChange={(e) => handleToggle('notifyEmail', e.target.checked)}
                disabled={saving}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>ℹ️ О приложении</h2>
        <div className="about-info">
          <p><strong>Pomodoro Productivity</strong></p>
          <p>Версия: 1.0.0</p>
          <p>Техника Pomodoro — метод управления временем, разработанный Франческо Чирилло в конце 1980-х годов.</p>
          <p>Метод использует таймер для разбиения работы на интервалы, обычно по 25 минут, разделённые короткими перерывами.</p>
        </div>
      </div>
    </div>
  );
}
