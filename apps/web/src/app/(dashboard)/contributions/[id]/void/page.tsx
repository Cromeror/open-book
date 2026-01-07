import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VoidContributionPage({ params }: Props) {
  const { id } = await params;

  try {
    await requirePermission('aportes:manage');
  } catch {
    redirect('/contributions');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/contributions" className="hover:text-gray-700">
            Aportes
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/contributions/${id}`} className="hover:text-gray-700">
            Detalle
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Anular</span>
        </nav>
        <h1 className="text-2xl font-bold text-red-900">Anular Aporte</h1>
        <p className="text-gray-600">
          Anular el aporte #{id}
        </p>
      </div>

      {/* TODO: Implement in OB-007 */}
      <div className="rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Formulario: Anular Aporte
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">aportes:manage</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-007</span>
          </p>
          <div className="mt-4 text-left text-xs text-red-700 bg-red-100 rounded-lg p-4">
            <p className="font-medium">⚠️ IMPORTANTE - Inmutabilidad</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Los aportes NUNCA se eliminan</li>
              <li>Solo se pueden ANULAR con justificacion</li>
              <li>La anulacion queda registrada en el historial</li>
              <li>Se registra quien anulo, cuando y por que</li>
            </ul>
          </div>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Campos requeridos:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Motivo de anulacion (obligatorio)</li>
              <li>Documentacion de soporte (opcional)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/contributions/${id}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          disabled
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          Confirmar Anulacion
        </button>
      </div>
    </div>
  );
}
