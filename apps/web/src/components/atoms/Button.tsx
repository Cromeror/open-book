import * as icons from 'lucide-react';
import { BaseButton } from './BaseButton';

/**
 * Button - Text button with optional icon
 *
 * A button component that displays text (children) with an optional icon on the left side.
 * Uses BaseButton internally for consistent anatomy.
 * Defines its own variant and size system.
 *
 * @example
 * <Button variant="primary" icon="Edit" size="sm">
 *   Edit
 * </Button>
 */

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof icons; // lucide-react icon name (optional, left side)
  loading?: boolean;
  children: React.ReactNode; // Required - button text
}

// Variant classes for Button
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  success: 'bg-green-100 text-green-700 hover:bg-green-200',
  danger: 'bg-red-100 text-red-700 hover:bg-red-200',
  warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
};

// Size classes for Button
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

// Icon sizes by button size
const iconSizes: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function Button({
  variant = 'primary',
  size = 'sm',
  icon,
  loading = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  // Dynamically get the icon component from lucide-react
  const IconComponent = icon ? (icons[icon] as React.ComponentType<{ className?: string }>) : null;

  // Compose className with variant and size classes
  const buttonClassName = [
    'font-medium',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <BaseButton
      loading={loading}
      loadingIconClassName={iconSizes[size]}
      className={buttonClassName}
      {...props}
    >
      {IconComponent && <IconComponent className={iconSizes[size]} />}
      {children}
    </BaseButton>
  );
}
