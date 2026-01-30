import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * BaseButton - Internal base component for all button types
 *
 * This component is NOT exported and should only be used internally
 * by Button and IconButton atoms. It provides shared anatomy and
 * common props handling without predefined variants.
 *
 * Derived components (Button, IconButton) define their own variants.
 */

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingIconClassName?: string;
  hideChildrenWhenLoading?: boolean;
  children: React.ReactNode;
}

// Common base classes shared by all button types
const baseClasses = 'inline-flex items-center justify-center rounded transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

export function BaseButton({
  loading = false,
  loadingIconClassName = 'h-4 w-4',
  hideChildrenWhenLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: BaseButtonProps) {
  const classes = [baseClasses, className].join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className={`${loadingIconClassName} animate-spin`} />}
      {(!loading || !hideChildrenWhenLoading) && children}
    </button>
  );
}
