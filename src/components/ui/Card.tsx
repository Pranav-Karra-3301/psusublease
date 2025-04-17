'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function Card({ 
  variant = 'default', 
  children, 
  className, 
  fullWidth = false,
  ...props 
}: CardProps) {
  return (
    <div 
      className={cn(
        "p-6 rounded-lg transition-all duration-200",
        variant === 'glass' ? 'glass-card' : 'bg-bg-secondary border border-border-light',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 