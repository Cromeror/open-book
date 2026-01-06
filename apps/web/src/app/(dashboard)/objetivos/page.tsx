import { redirect } from 'next/navigation';

import { requireModule } from '@/lib/permissions.server';

export default async function ObjetivosPage() {
  try {
    await requireModule('objetivos');
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Objetivos</h1>
        <p className="text-gray-600">
          Gestiona los objetivos de recaudo de la copropiedad
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">
          El modulo de objetivos esta en desarrollo.
        </p>
      </div>
    </div>
  );
}
