import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

interface GoalStatesPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalStatesPage({ params }: GoalStatesPageProps) {
  const { id } = await params;

  try {
    await requirePermission('goals:manage');
  } catch {
    redirect(`/goals/${id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/goals" className="hover:text-gray-700">
            Objetivos
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/goals/${id}`} className="hover:text-gray-700">
            Detalle
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Estados</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Gestionar Estados</h1>
        <p className="text-gray-600">
          Administra el ciclo de vida del objetivo
        </p>
      </div>

      {/* TODO: Implement in OB-004 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 p-3">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Gestion de Estados del Objetivo
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">goals:manage</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-004</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Estados disponibles:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><span className="font-medium">Borrador</span> - Objetivo en preparacion</li>
              <li><span className="font-medium">Activo</span> - Recibiendo aportes</li>
              <li><span className="font-medium">Pausado</span> - Temporalmente detenido</li>
              <li><span className="font-medium">Finalizado</span> - Meta alcanzada o fecha cumplida</li>
              <li><span className="font-medium">Cancelado</span> - Objetivo descartado</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Historial de Estados</h3>
        <div className="text-center text-sm text-gray-500 py-8">
          El historial de cambios de estado se mostrara aqui
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/goals/${id}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
