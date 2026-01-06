import { redirect } from 'next/navigation';

import { requireModule } from '@/lib/permissions.server';

export default async function PQRPage() {
  try {
    await requireModule('pqr');
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">PQR</h1>
        <p className="text-gray-600">
          Peticiones, quejas y reclamos
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">
          El modulo de PQR esta en desarrollo.
        </p>
      </div>
    </div>
  );
}
