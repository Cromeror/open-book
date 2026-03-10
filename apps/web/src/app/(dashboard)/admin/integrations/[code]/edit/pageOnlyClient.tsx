'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Integration } from '@/types/business/integration.types';
import { IntegrationForm } from '@/components/organisms/integrations/IntegrationForm';
import { updateIntegration } from '@/lib/http-api/integrations-api';
import type { UpdateIntegrationDto } from '@/lib/http-api/integrations-api';

interface Props {
  integration: Integration;
}

export function EditIntegrationClient({ integration }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { name: string; description?: string | null; baseUrl: string; authType: string; connectionType: string; managesUsers: boolean; internalPermissions: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const updateData: UpdateIntegrationDto = {
        name: data.name,
        description: data.description || null,
        baseUrl: data.baseUrl,
        authType: data.authType,
        connectionType: data.connectionType,
        managesUsers: data.managesUsers,
        internalPermissions: data.internalPermissions,
      };
      await updateIntegration(integration.code, updateData);
      router.push(`/admin/integrations/${integration.code}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la integracion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Editar Integracion</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <IntegrationForm
        defaultValues={{
          code: integration.code,
          name: integration.name,
          description: integration.description ?? '',
          baseUrl: integration.baseUrl,
          authType: integration.authType as 'none' | 'bearer' | 'basic' | 'api_key' | 'devise_token_auth',
          connectionType: integration.connectionType as 'passthrough' | 'oauth' | 'api_key_stored',
          managesUsers: integration.managesUsers,
          internalPermissions: integration.internalPermissions,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/admin/integrations/${integration.code}`)}
        isEditing
        loading={loading}
      />
    </div>
  );
}
