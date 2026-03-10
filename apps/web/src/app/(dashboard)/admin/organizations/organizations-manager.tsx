'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Organization } from '@/types/business/organization.types';
import type { PaginatedResponse } from '@/lib/http-api/organizations-api';
import {
  deleteOrganization,
  toggleOrganizationStatus,
} from '@/lib/http-api/organizations-api';
import { OrganizationList } from '@/components/organisms/organizations/OrganizationList';

interface Props {
  initialOrganizations: PaginatedResponse<Organization>;
}

export function OrganizationsManager({ initialOrganizations }: Props) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations?.data || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectOrganization = (organization: Organization) => {
    router.push(`/admin/organizations/${organization.code}`);
  };

  const handleEditOrganization = (organization: Organization) => {
    router.push(`/admin/organizations/${organization.code}/edit`);
  };

  const handleStartCreate = () => {
    router.push('/admin/organizations/new');
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    if (!confirm(`Estas seguro de eliminar "${organization.name}"?`)) return;

    setLoading(true);
    setError(null);

    try {
      await deleteOrganization(organization.code);
      setOrganizations((prev) => prev.filter((o) => o.id !== organization.id));
      setSuccessMessage('Organizacion eliminada correctamente');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (organization: Organization) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await toggleOrganizationStatus(organization.code);
      setOrganizations((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      setSuccessMessage(
        `Organizacion ${updated.isActive ? 'activada' : 'desactivada'} correctamente`,
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

      <OrganizationList
        organizations={organizations}
        onSelectOrganization={handleSelectOrganization}
        onEditOrganization={handleEditOrganization}
        onDeleteOrganization={handleDeleteOrganization}
        onToggleStatus={handleToggleStatus}
        onCreateOrganization={handleStartCreate}
        loading={loading}
      />
    </div>
  );
}
