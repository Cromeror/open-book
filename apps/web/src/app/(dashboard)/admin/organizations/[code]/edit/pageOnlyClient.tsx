'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Organization } from '@/types/business/organization.types';
import type { Integration } from '@/types/business/integration.types';
import { OrganizationForm, type OrganizationFormValues } from '@/components/organisms/organizations/OrganizationForm';
import { updateOrganization } from '@/lib/http-api/organizations-api';
import type { UpdateOrganizationDto } from '@/lib/http-api/organizations-api';

interface Props {
  organization: Organization;
  integrations: Integration[];
}

export function EditOrganizationClient({ organization, integrations }: Props) {
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

      const updateData: UpdateOrganizationDto = {
        name: data.name,
        description: data.description || null,
        externalId: data.externalId || null,
        integrationId: data.integrationId || null,
        credentials,
      };
      await updateOrganization(organization.code, updateData);
      router.push(`/admin/organizations/${organization.code}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la organizacion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Editar Organizacion</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <OrganizationForm
        defaultValues={{
          code: organization.code,
          name: organization.name,
          description: organization.description ?? '',
          externalId: organization.externalId ?? '',
          integrationId: organization.integrationId ?? '',
        }}
        integrations={integrations}
        hasExistingCredentials={organization.hasCredentials ?? false}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/admin/organizations/${organization.code}`)}
        isEditing
        loading={loading}
      />
    </div>
  );
}
