import Link from 'next/link';
import { ShieldX } from 'lucide-react';

interface AccessDeniedProps {
  /** The permission that was required */
  requiredPermission?: string;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Whether to show a link back to dashboard */
  showBackLink?: boolean;
  /** Variant for different display contexts */
  variant?: 'page' | 'section' | 'inline';
}

/**
 * AccessDenied component for displaying permission errors
 *
 * @example
 * ```tsx
 * // Full page access denied
 * <AccessDenied
 *   title="Access Denied"
 *   message="You don't have permission to view this page"
 *   showBackLink
 * />
 *
 * // Section within a page
 * <AccessDenied variant="section" requiredPermission="reportes:export" />
 *
 * // Inline message
 * <AccessDenied variant="inline" message="Contact admin for access" />
 * ```
 */
export function AccessDenied({
  requiredPermission,
  title = 'Acceso Denegado',
  message = 'No tienes permiso para acceder a este contenido.',
  showBackLink = false,
  variant = 'section',
}: AccessDeniedProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <ShieldX className="h-4 w-4" />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-2">
            <ShieldX className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-red-800">{title}</h3>
            <p className="mt-1 text-sm text-red-700">{message}</p>
            {requiredPermission && (
              <p className="mt-2 text-xs text-red-600">
                Permiso requerido:{' '}
                <code className="rounded bg-red-100 px-1 py-0.5">
                  {requiredPermission}
                </code>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // variant === 'page'
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{message}</p>
        {requiredPermission && (
          <p className="mt-3 text-sm text-gray-500">
            Permiso requerido:{' '}
            <code className="rounded bg-gray-100 px-2 py-1">
              {requiredPermission}
            </code>
          </p>
        )}
        {showBackLink && (
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Volver al Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
