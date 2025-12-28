import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xl',
    md: 'h-10 w-10 text-2xl',
    lg: 'h-12 w-12 text-3xl',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold`}>
        T
      </div>
      <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
        TaskManager
      </span>
    </div>
  );
};

export default Logo;