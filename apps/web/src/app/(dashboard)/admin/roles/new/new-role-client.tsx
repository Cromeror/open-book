'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PoolForm, type PoolFormData } from '@/components/organisms';

export function NewRoleClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PoolFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear rol');
      }

      router.push('/admin/roles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <PoolForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/roles')}
          loading={loading}
        />
      </div>
    </>
  );
}
