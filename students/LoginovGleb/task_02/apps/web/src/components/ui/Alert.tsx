import React from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  className?: string;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const Alert: React.FC<AlertProps> = ({ children, variant = 'info', onClose, className }) => {
  const Icon = icons[variant];

  return (
    <div className={clsx('alert', `alert-${variant}`, className)} role="alert" data-testid="error-message">
      <Icon className="alert-icon" size={20} />
      <div className="alert-content">{children}</div>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Закрыть">
          <X size={18} />
        </button>
      )}
    </div>
  );
};
