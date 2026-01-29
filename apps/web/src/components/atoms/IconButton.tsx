import * as icons from 'lucide-react';
import { BaseButton } from './BaseButton';

/**
 * IconButton - Icon-only button
 *
 * A compact button that displays only an icon (no text).
 * Requires a title prop for accessibility.
 * Uses BaseButton internally for consistent anatomy.
 * Has predefined variant colors optimized for icon-only display.
 *
 * @example
 * <IconButton
 *   icon="Edit"
 *   variant="primary"
 *   size="sm"
 *   title="Edit preset"
 * />
 */

export type IconButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: keyof typeof icons; // lucide-react icon name (required)
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  title: string; // Required for accessibility
}

// Icon-focused variant classes (text color + subtle hover background)
const variantClasses: Record<IconButtonVariant, string> = {
  primary: 'text-blue-600 hover:bg-blue-50',
  secondary: 'text-gray-600 hover:bg-gray-50',
  success: 'text-green-600 hover:bg-green-50',
  danger: 'text-red-600 hover:bg-red-50',
  warning: 'text-amber-600 hover:bg-amber-50',
};

// Compact sizes for icon-only buttons (padding only)
const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
};

// Icon size by button size
const iconSizes: Record<IconButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function IconButton({
  icon,
  variant = 'primary',
  size = 'sm',
  loading = false,
  title,
  className = '',
  ...props
}: IconButtonProps) {
  // Get icon component from lucide-react
  const IconComponent = icons[icon] as React.ComponentType<{ className?: string }>;

  // Compose className with variant and size classes
  const buttonClassName = [
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <BaseButton
      loading={loading}
      loadingIconClassName={iconSizes[size]}
      hideChildrenWhenLoading={true}
      className={buttonClassName}
      title={title}
      {...props}
    >
      {IconComponent && <IconComponent className={iconSizes[size]} />}
    </BaseButton>
  );
}
