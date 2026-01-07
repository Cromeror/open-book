import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requirePermission } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ number: string }>;
}

export default async function PQRDetailPage({ params }: Props) {
  const { number } = await params;

  try {
    await requirePermission('pqr:read');
  } catch {
    redirect('/pqr');
  }

  const permissions = await getServerPermissions();
  const canRespond = permissions.can('pqr:manage');

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/pqr" className="hover:text-gray-700">
            PQR
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">#{number}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Solicitud #{number}</h1>
        <p className="text-gray-600">
          Detalle de la solicitud PQR
        </p>
      </div>

      {/* TODO: Implement in OB-010 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 p-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Vista: Detalle de PQR
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">pqr:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-010</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Informacion mostrada:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Numero de radicado</li>
              <li>Tipo (Peticion / Queja / Reclamo)</li>
              <li>Estado actual</li>
              <li>Fecha de creacion</li>
              <li>Asunto y descripcion</li>
              <li>Historial de respuestas</li>
              <li>Documentos adjuntos</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/pqr"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </Link>
        {canRespond && (
          <Link
            href={`/pqr/${number}/respond`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Responder
          </Link>
        )}
      </div>
    </div>
  );
}
