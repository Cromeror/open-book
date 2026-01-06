import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
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

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Al iniciar sesión, aceptas nuestros{' '}
          <a href="/terminos" className="text-blue-600 hover:underline">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="/privacidad" className="text-blue-600 hover:underline">
            Política de Privacidad
          </a>
        </p>
      </div>
    </main>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="mt-1 h-10 w-full rounded bg-gray-200" />
      </div>
      <div>
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="mt-1 h-10 w-full rounded bg-gray-200" />
      </div>
      <div className="h-10 w-full rounded bg-gray-200" />
    </div>
  );
}
