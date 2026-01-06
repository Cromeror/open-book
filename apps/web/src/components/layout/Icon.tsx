import * as icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconName = keyof typeof icons;

interface IconProps extends LucideProps {
  name: string;
}

/**
 * Dynamic icon component that renders lucide-react icons by name
 */
export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = icons[name as IconName] as React.ComponentType<LucideProps>;

  if (!LucideIcon) {
    // Fallback to a default icon if not found
    const FallbackIcon = icons.Circle as React.ComponentType<LucideProps>;
    return <FallbackIcon {...props} />;
  }

  return <LucideIcon {...props} />;
}
