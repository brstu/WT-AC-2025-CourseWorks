import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sessionsApi, tasksApi, extractError } from '../api';
import { Session, Task, SessionType, SessionStatus } from '../types';
import { LoadingSpinner, ErrorMessage, useToast, ConfirmDialog } from '../components';

const SESSION_DURATIONS: Record<SessionType, number> = {
  pomodoro: 25 * 60,      // 25 минут
  short_break: 5 * 60,    // 5 минут
  long_break: 15 * 60,    // 15 минут
};

const SESSION_LABELS: Record<SessionType, string> = {
  pomodoro: 'Помодоро',
  short_break: 'Короткий перерыв',
  long_break: 'Длинный перерыв',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TimerPage() {
  const { showToast } = useToast();
  
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Загрузка задач
  const loadTasks = useCallback(async () => {
    try {
      const data = await tasksApi.list({ status: 'in_progress', limit: 100 });
      setTasks(data);
      if (data.length > 0 && !selectedTaskId) {
        setSelectedTaskId(data[0].id);
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedTaskId]);

  // Загрузка активной сессии
  const loadActiveSession = useCallback(async () => {
    try {
      const data = await sessionsApi.list({ status: 'running', limit: 1 });
      if (data.length > 0) {
        const session = data[0];
        setCurrentSession(session);
        setSessionType(session.sessionType);
        setIsRunning(session.status === 'running');
        
        // Вычисляем оставшееся время
        const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
        const duration = session.duration || SESSION_DURATIONS[session.sessionType];
        const remaining = Math.max(0, duration - elapsed + session.totalPausedSeconds);
        setTimeLeft(remaining);
      }
      
      // Проверяем паузу
      const pausedData = await sessionsApi.list({ status: 'paused', limit: 1 });
      if (pausedData.length > 0) {
        const session = pausedData[0];
        setCurrentSession(session);
        setSessionType(session.sessionType);
        setIsRunning(false);
        
        const elapsed = Math.floor((new Date(session.pausedAt!).getTime() - new Date(session.startTime).getTime()) / 1000);
        const duration = session.duration || SESSION_DURATIONS[session.sessionType];
        const remaining = Math.max(0, duration - elapsed + session.totalPausedSeconds);
        setTimeLeft(remaining);
      }
    } catch (err) {
      console.error('Failed to load active session:', err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadActiveSession();
  }, [loadTasks, loadActiveSession]);

  // Таймер
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Таймер завершён естественным образом
            handleTimerFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Звуковое уведомление
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAAbIGhqpN0U0F4rNrVpGIjADSS19yzeAsAbIqtspF2VUF8uODYpGIjADSW3N6zeAsA');
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Начать сессию
  const handleStart = async () => {
    try {
      const session = await sessionsApi.create({
        taskId: selectedTaskId || undefined,
        sessionType,
        duration: SESSION_DURATIONS[sessionType],
      });
      setCurrentSession(session);
      setIsRunning(true);
      setTimeLeft(SESSION_DURATIONS[sessionType]);
      showToast('success', `${SESSION_LABELS[sessionType]} начат!`);
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  // Пауза/продолжение
  const handlePauseResume = async () => {
    if (!currentSession) return;

    try {
      if (isRunning) {
        const session = await sessionsApi.pause(currentSession.id);
        setCurrentSession(session);
        setIsRunning(false);
        showToast('info', 'Таймер приостановлен');
      } else {
        const session = await sessionsApi.resume(currentSession.id);
        setCurrentSession(session);
        setIsRunning(true);
        showToast('info', 'Таймер продолжен');
      }
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  // Естественное завершение таймера (дошел до 0)
  const handleTimerFinish = async () => {
    if (!currentSession) return;

    try {
      await sessionsApi.update(currentSession.id, {
        status: 'completed',
        endTime: new Date().toISOString(),
      });
      setCurrentSession(null);
      setIsRunning(false);
      
      if (sessionType === 'pomodoro') {
        setCompletedPomodoros((prev) => prev + 1);
        showToast('success', '🎉 Помодоро завершён!');
        
        // Автоматически предлагаем перерыв
        const newType = (completedPomodoros + 1) % 4 === 0 ? 'long_break' : 'short_break';
        setSessionType(newType);
        setTimeLeft(SESSION_DURATIONS[newType]);
      } else {
        showToast('success', 'Перерыв завершён! Время работать!');
        setSessionType('pomodoro');
        setTimeLeft(SESSION_DURATIONS.pomodoro);
      }
      
      playNotification();
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  // Прервать сессию (Стоп)
  const handleComplete = async () => {
    if (!currentSession) return;

    try {
      await sessionsApi.update(currentSession.id, {
        status: 'interrupted',
        endTime: new Date().toISOString(),
      });
      setCurrentSession(null);
      setIsRunning(false);
      setTimeLeft(SESSION_DURATIONS[sessionType]);
      
      showToast('info', 'Сессия прервана');
    } catch (err) {
      showToast('error', extractError(err));
    }
  };

  // Прервать сессию
  const handleStop = async () => {
    if (!currentSession) return;

    try {
      await sessionsApi.update(currentSession.id, {
        status: 'interrupted',
        endTime: new Date().toISOString(),
      });
      setCurrentSession(null);
      setIsRunning(false);
      setTimeLeft(SESSION_DURATIONS[sessionType]);
      showToast('warning', 'Сессия прервана');
    } catch (err) {
      showToast('error', extractError(err));
    }
    setShowStopConfirm(false);
  };

  // Смена типа сессии
  const handleTypeChange = (type: SessionType) => {
    if (currentSession) {
      showToast('warning', 'Завершите текущую сессию перед сменой типа');
      return;
    }
    setSessionType(type);
    setTimeLeft(SESSION_DURATIONS[type]);
  };

  if (loading) {
    return <LoadingSpinner text="Загрузка таймера..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadTasks} />;
  }

  const progress = ((SESSION_DURATIONS[sessionType] - timeLeft) / SESSION_DURATIONS[sessionType]) * 100;

  return (
    <div className="timer-page">
      <div className="page-header">
        <h1>⏱️ Pomodoro Таймер</h1>
        <div className="pomodoro-counter">
          🍅 Завершено сегодня: <strong>{completedPomodoros}</strong>
        </div>
      </div>

      {/* Выбор типа сессии */}
      <div className="session-types">
        {(Object.keys(SESSION_LABELS) as SessionType[]).map((type) => (
          <button
            key={type}
            className={`session-type-btn ${sessionType === type ? 'active' : ''} ${currentSession ? 'disabled' : ''}`}
            onClick={() => handleTypeChange(type)}
            disabled={!!currentSession}
          >
            {SESSION_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Таймер */}
      <div className={`timer-display timer-display--${sessionType}`}>
        <svg className="timer-progress" viewBox="0 0 100 100">
          <circle
            className="timer-progress-bg"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.2"
          />
          <circle
            className="timer-progress-bar"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="timer-time">{formatTime(timeLeft)}</div>
        <div className="timer-label">{SESSION_LABELS[sessionType]}</div>
      </div>

      {/* Выбор задачи */}
      {sessionType === 'pomodoro' && (
        <div className="task-selector">
          <label>Задача:</label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={!!currentSession}
          >
            <option value="">Без задачи</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Управление */}
      <div className="timer-controls">
        {!currentSession ? (
          <button className="btn btn-primary btn-lg" onClick={handleStart}>
            ▶ Начать
          </button>
        ) : (
          <>
            <button className="btn btn-primary btn-lg" onClick={handlePauseResume}>
              {isRunning ? '⏸ Пауза' : '▶ Продолжить'}
            </button>
            <button className="btn btn-danger btn-lg" onClick={() => setShowStopConfirm(true)}>
              ⏹ Стоп
            </button>
          </>
        )}
      </div>

      {/* Текущая задача */}
      {currentSession?.task && (
        <div className="current-task-info">
          <span className="label">Текущая задача:</span>
          <span className="task-title">{currentSession.task.title}</span>
        </div>
      )}

      <ConfirmDialog
        isOpen={showStopConfirm}
        title="Прервать сессию?"
        message="Вы уверены, что хотите прервать текущую сессию? Прогресс будет потерян."
        confirmLabel="Прервать"
        onConfirm={handleStop}
        onCancel={() => setShowStopConfirm(false)}
        isDanger
      />
    </div>
  );
}
