import React from 'react';
import clsx from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', className, text }) => {
  return (
    <div className={clsx('loading', `loading-${size}`, className)} data-testid="loading-indicator">
      <svg className="loading-spinner" viewBox="0 0 50 50">
        <circle
          className="loading-track"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="loading-head"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

interface LoadingOverlayProps {
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text = 'Загрузка...' }) => {
  return (
    <div className="loading-overlay" data-testid="loading-indicator">
      <Loading size="lg" text={text} />
    </div>
  );
};
