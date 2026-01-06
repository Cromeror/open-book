import { redirect } from 'next/navigation';

import { requireModule } from '@/lib/permissions.server';

export default async function AportesPage() {
  try {
    await requireModule('aportes');
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aportes</h1>
        <p className="text-gray-600">
          Registro y seguimiento de aportes reales
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">
          El modulo de aportes esta en desarrollo.
        </p>
      </div>
    </div>
  );
}
