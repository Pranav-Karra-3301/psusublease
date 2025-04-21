'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'highlight';
  children: React.ReactNode;
  fullWidth?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ 
  variant = 'default', 
  children, 
  className,
  fullWidth = false,
  padding = 'md',
  ...props 
}: CardProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={cn(
        "rounded-lg transition-shadow duration-200",
        paddingClasses[padding],
        variant === 'glass' ? 'bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100' : 
        variant === 'highlight' ? 'bg-white border border-primary/20 shadow-sm hover:shadow' :
        'bg-white border border-border-light shadow-sm hover:shadow',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 