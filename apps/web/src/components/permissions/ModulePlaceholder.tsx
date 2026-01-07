import Link from 'next/link';

interface ModulePlaceholderProps {
  /**
   * Title of the module/view being implemented
   */
  title: string;
  /**
   * Description of what this module will contain
   */
  description?: string;
  /**
   * The permission or module required (displayed to developers)
   */
  permission?: string;
  /**
   * The epic ID where this will be implemented
   */
  epic?: string;
  /**
   * Optional list of features to be implemented
   */
  features?: string[];
  /**
   * Optional back link
   */
  backLink?: {
    href: string;
    label: string;
  };
  /**
   * Visual variant
   * @default 'default'
   */
  variant?: 'default' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'border-gray-300 bg-gray-50',
  warning: 'border-amber-300 bg-amber-50',
  danger: 'border-red-300 bg-red-50',
};

/**
 * A placeholder component for modules that are not yet implemented.
 * Displays a consistent "coming soon" style card with development info.
 *
 * @example
 * ```tsx
 * <ModulePlaceholder
 *   title="Lista de Usuarios"
 *   description="Gestiona usuarios del sistema"
 *   permission="users:read"
 *   epic="OB-002"
 *   features={[
 *     'Ver lista de usuarios',
 *     'Filtrar por rol',
 *     'Buscar por nombre',
 *   ]}
 *   backLink={{ href: '/dashboard', label: 'Volver' }}
 * />
 * ```
 */
export function ModulePlaceholder({
  title,
  description,
  permission,
  epic,
  features,
  backLink,
  variant = 'default',
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className={`rounded-lg border-2 border-dashed p-8 ${variantStyles[variant]}`}>
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          {(permission || epic) && (
            <p className="mt-2 text-sm text-gray-500">
              {permission && (
                <>
                  Permiso: <code className="rounded bg-gray-200 px-1">{permission}</code>
                </>
              )}
              {permission && epic && ' | '}
              {epic && (
                <>
                  Epic: <span className="font-medium">{epic}</span>
                </>
              )}
            </p>
          )}
          {features && features.length > 0 && (
            <div className="mt-4 text-left text-xs text-gray-400">
              <ul className="list-inside list-disc space-y-1">
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {backLink && (
        <Link
          href={backLink.href}
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {backLink.label}
        </Link>
      )}
    </div>
  );
}
