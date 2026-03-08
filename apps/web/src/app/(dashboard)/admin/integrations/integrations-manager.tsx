'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Integration } from '@/types/business/integration.types';
import type { PaginatedResponse } from '@/lib/http-api/integrations-api';
import {
  deleteIntegration,
  toggleIntegrationStatus,
} from '@/lib/http-api/integrations-api';
import { IntegrationList } from '@/components/organisms/integrations/IntegrationList';

interface Props {
  initialIntegrations: PaginatedResponse<Integration>;
}

export function IntegrationsManager({ initialIntegrations }: Props) {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations?.data || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectIntegration = (integration: Integration) => {
    router.push(`/admin/integrations/${integration.code}`);
  };

  const handleStartCreate = () => {
    router.push('/admin/integrations/new');
  };

  const handleDeleteIntegration = async (integration: Integration) => {
    if (!confirm(`Estas seguro de eliminar "${integration.name}"?`)) return;

    setLoading(true);
    setError(null);

    try {
      await deleteIntegration(integration.code);
      setIntegrations((prev) => prev.filter((i) => i.id !== integration.id));
      setSuccessMessage('Integracion eliminada correctamente');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (integration: Integration) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await toggleIntegrationStatus(integration.code);
      setIntegrations((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i)),
      );
      setSuccessMessage(
        `Integracion ${updated.isActive ? 'activada' : 'desactivada'} correctamente`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          {successMessage}
        </div>
      )}

      <IntegrationList
        integrations={integrations}
        onSelectIntegration={handleSelectIntegration}
        onDeleteIntegration={handleDeleteIntegration}
        onToggleStatus={handleToggleStatus}
        onCreateIntegration={handleStartCreate}
        loading={loading}
      />
    </div>
  );
}
