import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  color?: string; // Hex color для динамических статусов
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', color, className }) => {
  const style = color
    ? {
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color,
      }
    : undefined;

  return (
    <span className={clsx('badge', !color && `badge-${variant}`, className)} style={style}>
      {children}
    </span>
  );
};
