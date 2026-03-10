'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Integration } from '@/types/business/integration.types';
import { OrganizationForm, type OrganizationFormValues } from '@/components/organisms/organizations/OrganizationForm';
import { createOrganization } from '@/lib/http-api/organizations-api';

interface Props {
  integrations: Integration[];
}

export function NewOrganizationClient({ integrations }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: OrganizationFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const credentials =
        data.credentialEmail && data.credentialPassword
          ? { email: data.credentialEmail, password: data.credentialPassword }
          : undefined;

      await createOrganization({
        code: data.code,
        name: data.name,
        description: data.description || null,
        externalId: data.externalId || null,
        integrationId: data.integrationId || null,
        credentials,
      });
      router.push('/admin/organizations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la organizacion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Nueva Organizacion</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <OrganizationForm
        integrations={integrations}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/organizations')}
        loading={loading}
      />
    </div>
  );
}
