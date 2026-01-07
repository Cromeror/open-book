import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireModule } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NotificationDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    await requireModule('notificaciones');
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/notifications" className="hover:text-gray-700">Notificaciones</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Detalle</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Detalle de Notificacion</h1>
        <p className="text-gray-600">Notificacion #{id}</p>
      </div>

      {/* TODO: Implement in OB-010 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Detalle de Notificacion</h3>
          <p className="mt-1 text-sm text-gray-500">
            Modulo: <code className="rounded bg-gray-200 px-1">notificaciones</code> | Epic: <span className="font-medium">OB-010</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Titulo y contenido</li>
              <li>Fecha de recepcion</li>
              <li>Estado (leida/no leida)</li>
              <li>Acciones relacionadas</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/notifications" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
        <button disabled className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed">
          Marcar como Leida
        </button>
      </div>
    </div>
  );
}
