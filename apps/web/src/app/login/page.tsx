import { redirect } from 'next/navigation';

import { getServerPermissions } from '@/lib/permissions.server';

export const metadata = {
  title: 'Iniciar Sesión - OpenBook',
  description: 'Inicia sesión en tu cuenta de OpenBook',
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

/**
 * Login page - redirects to home if already authenticated
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const permissions = await getServerPermissions();
  const params = await searchParams;

  // If already authenticated, redirect to intended page or home
  if (permissions.isAuthenticated) {
    const redirectTo = params.redirect || '/';
    redirect(redirectTo);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">OpenBook</h1>
          <p className="mt-2 text-gray-600">
            Gestión transparente de copropiedades
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Iniciar Sesión
          </h2>

          {/* TODO: Implement login form in OB-014-B */}
          <p className="text-center text-gray-500">
            Formulario de login pendiente de implementación.
          </p>

          {params.redirect && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Serás redirigido a: <code className="text-blue-600">{params.redirect}</code>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
