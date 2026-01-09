import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, FileText, ClipboardList, Settings, Users } from 'lucide-react';
import { useAuth } from '../../contexts';
import { Button } from '../ui';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <ClipboardList size={24} />
          <span>Да, я в деле</span>
        </Link>

        <nav className="header-nav">
          {isAuthenticated && (
            <Link to="/applications" className="header-link">
              <FileText size={18} />
              <span>Заявки</span>
            </Link>
          )}

          <Link to="/forms" className="header-link">
            <ClipboardList size={18} />
            <span>Формы</span>
          </Link>

          {isAuthenticated && isModerator && (
            <Link to="/statuses" className="header-link">
              <Settings size={18} />
              <span>Статусы</span>
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link to="/admin" className="header-link">
              <Users size={18} />
              <span>Админ</span>
            </Link>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="header-user">
              <span className="header-username">
                {user?.username}
                <span className="header-role">({user?.role})</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="logout-btn"
              >
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <div className="header-auth">
              <Link to="/login">
                <Button variant="ghost" size="sm">Войти</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Регистрация</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
