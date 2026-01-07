import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

export default async function ManagePQRPage() {
  try {
    await requirePermission('pqr:manage');
  } catch {
    redirect('/pqr');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/pqr" className="hover:text-gray-700">
            PQR
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Gestionar</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Gestion de PQR</h1>
        <p className="text-gray-600">
          Panel de administracion de todas las solicitudes
        </p>
      </div>

      {/* TODO: Implement in OB-010 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 p-3">
            <svg
              className="h-6 w-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Vista: Panel de Gestion de PQR
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">pqr:manage</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-010</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Funcionalidades:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Lista de todas las solicitudes</li>
              <li>Filtros por tipo, estado, fecha</li>
              <li>Asignar a responsable</li>
              <li>Responder solicitudes</li>
              <li>Metricas de tiempos de respuesta</li>
            </ul>
            <p className="mt-3 font-medium text-gray-500">Estados de PQR:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Recibido</li>
              <li>En Tramite</li>
              <li>Respondido</li>
              <li>Cerrado</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/pqr"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a Mis PQR
        </Link>
      </div>
    </div>
  );
}
