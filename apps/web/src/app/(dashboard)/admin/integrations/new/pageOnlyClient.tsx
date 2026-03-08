'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IntegrationForm } from '@/components/organisms/integrations/IntegrationForm';
import { createIntegration } from '@/lib/http-api/integrations-api';

export function NewIntegrationClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Parameters<typeof createIntegration>[0]) => {
    setLoading(true);
    setError(null);

    try {
      await createIntegration(data);
      router.push('/admin/integrations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la integracion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Nueva Integracion</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <IntegrationForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/integrations')}
        loading={loading}
      />
    </div>
  );
}
