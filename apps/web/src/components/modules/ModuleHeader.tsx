'use client';

import { Icon } from '@/components/layout/Icon';

interface ModuleHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  onBack?: () => void;
}

/**
 * Header component for module pages
 */
export function ModuleHeader({
  title,
  description,
  icon,
  onBack,
}: ModuleHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Volver"
        >
          <Icon name="ArrowLeft" className="w-5 h-5" />
        </button>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
              <Icon name={icon} className="w-5 h-5" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}
