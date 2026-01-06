import Link from 'next/link';

import { getServerPermissions } from '@/lib/permissions.server';

export const metadata = {
  title: 'Acceso Denegado - OpenBook',
  description: 'No tienes permiso para acceder a esta página',
};

/**
 * Access denied page shown when user doesn't have permission to access a resource
 */
export default async function AccesoDenegadoPage() {
  const permissions = await getServerPermissions();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Acceso Denegado
        </h1>

        <p className="mb-8 text-gray-600">
          No tienes permiso para acceder a esta página. Si crees que esto es un
          error, contacta al administrador del sistema.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {permissions.isAuthenticated ? (
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Ir al Inicio
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        {permissions.isAuthenticated && (
          <p className="mt-8 text-sm text-gray-500">
            Sesión activa como:{' '}
            <span className="font-medium">
              {permissions.userId ? 'Usuario autenticado' : 'Desconocido'}
            </span>
          </p>
        )}
      </div>
    </main>
  );
}
