'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  isLoading = false,
  children, 
  className, 
  disabled,
  ...props 
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-white border border-transparent shadow-sm',
    secondary: 'bg-white text-primary border border-gray-200 shadow-sm',
    outline: 'bg-white text-gray-800 border border-gray-200 shadow-sm',
    danger: 'bg-error text-white border border-transparent shadow-sm',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1',
    md: 'px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  return (
    <button
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'rounded-md font-medium',
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
} 