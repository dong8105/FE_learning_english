import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'glass' | 'elevated' | 'bordered';
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-theme-surface border border-theme-subtle text-theme-main shadow-sm shadow-slate-900/5',
    glass: 'glass-card',
    elevated: 'bg-theme-card border border-theme-subtle text-theme-main shadow-lg shadow-indigo-950/5 dark:shadow-black/40',
    bordered: 'bg-transparent border border-theme-default text-theme-main',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
