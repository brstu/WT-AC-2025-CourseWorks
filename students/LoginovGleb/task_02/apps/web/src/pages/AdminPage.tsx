import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ClipboardList, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts';
import { Card, CardBody, Alert } from '../components';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="page-container">
        <Alert variant="error">
          У вас нет прав для доступа к панели администратора.
        </Alert>
      </div>
    );
  }

  const adminLinks = [
    {
      title: 'Формы заявок',
      description: 'Управление шаблонами форм',
      icon: <ClipboardList size={32} />,
      to: '/forms',
      color: '#3b82f6',
    },
    {
      title: 'Статусы',
      description: 'Настройка статусов заявок',
      icon: <Settings size={32} />,
      to: '/statuses',
      color: '#10b981',
    },
    {
      title: 'Все заявки',
      description: 'Просмотр всех заявок в системе',
      icon: <FileText size={32} />,
      to: '/applications',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="page-admin">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Панель администратора</h1>
          <p className="page-header-subtitle">
            Управление системой заявок
          </p>
        </div>
      </div>

      <div className="admin-grid">
        {adminLinks.map((link) => (
          <Link key={link.to} to={link.to} className="admin-card-link">
            <Card className="admin-card">
              <CardBody>
                <div
                  className="admin-card-icon"
                  style={{ backgroundColor: `${link.color}20`, color: link.color }}
                >
                  {link.icon}
                </div>
                <h2 className="admin-card-title">{link.title}</h2>
                <p className="admin-card-description">{link.description}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="admin-info">
        <CardBody>
          <h2>Информация о системе</h2>
          <div className="admin-info-grid">
            <div className="admin-info-item">
              <span className="admin-info-label">Вариант</span>
              <span className="admin-info-value">40 — «Да, я в деле»</span>
            </div>
            <div className="admin-info-item">
              <span className="admin-info-label">Ваша роль</span>
              <span className="admin-info-value">{user.role}</span>
            </div>
            <div className="admin-info-item">
              <span className="admin-info-label">Пользователь</span>
              <span className="admin-info-value">{user.username}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
