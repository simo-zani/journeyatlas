import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', compact = false, onClick }) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-lg shadow-lg
        border-l-4 border-gold p-6 transition-all hover:shadow-xl
        ${compact ? 'p-4' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
