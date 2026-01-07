import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommitmentContributionsPage({ params }: Props) {
  const { id } = await params;

  try {
    await requirePermission('compromisos:read');
  } catch {
    redirect('/commitments');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/commitments" className="hover:text-gray-700">
            Compromisos
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/commitments/${id}`} className="hover:text-gray-700">
            Detalle
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Aportes</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Aportes del Compromiso</h1>
        <p className="text-gray-600">
          Aportes que cumplen el compromiso #{id}
        </p>
      </div>

      {/* TODO: Implement in OB-006 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 p-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Vista: Aportes Asociados al Compromiso
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">compromisos:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-006</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Informacion mostrada:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Lista de aportes reales vinculados</li>
              <li>Monto total aportado vs comprometido</li>
              <li>Porcentaje de cumplimiento</li>
              <li>Fecha de cada aporte</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/commitments/${id}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver al Compromiso
        </Link>
      </div>
    </div>
  );
}
