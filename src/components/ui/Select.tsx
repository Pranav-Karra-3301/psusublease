'use client';

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

// Main Select component (basic version)
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2 w-full">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`appearance-none w-full bg-bg-secondary border ${
              error ? 'border-error' : 'border-border-light'
            } rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200 pr-10 ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-primary">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

// Additional components for the enhanced select
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex items-center justify-between w-full px-4 py-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="w-4 h-4 ml-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
);

interface SelectValueProps {
  children: ReactNode;
  placeholder?: string;
}

const SelectValue = ({ children, placeholder }: SelectValueProps) => (
  <span className={cn(
    "block truncate",
    !children && "text-text-secondary/50"
  )}>
    {children || placeholder || "Select an option"}
  </span>
);

interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-bg-secondary py-1 shadow-lg border border-border-light",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

interface SelectItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  value: string;
}

const SelectItem = forwardRef<HTMLLIElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "relative cursor-pointer select-none py-2 px-4 text-text-primary hover:bg-bg-primary/10",
        className
      )}
      {...props}
    >
      {children}
    </li>
  )
);

Select.displayName = 'Select';
SelectTrigger.displayName = 'SelectTrigger';
SelectValue.displayName = 'SelectValue';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';

export default Select;
export { SelectTrigger, SelectValue, SelectContent, SelectItem }; 