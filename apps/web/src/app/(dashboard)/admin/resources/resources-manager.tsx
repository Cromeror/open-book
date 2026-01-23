'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Resource, PaginatedResponse } from '@/types/resources';
import {
  deleteResource,
  toggleResourceStatus,
} from '@/lib/http-api/resources-api';
import { ResourceList } from '@/components/organisms/resources/ResourceList';

interface Props {
  initialResources: PaginatedResponse<Resource>;
}

export function ResourcesManager({ initialResources }: Props) {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>(initialResources?.data || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectResource = (resource: Resource) => {
    router.push(`/admin/resources/${resource.code}`);
  };

  const handleStartCreate = () => {
    router.push('/admin/resources/new');
  };

  const handleEditFromTable = (resource: Resource) => {
    router.push(`/admin/resources/${resource.code}/edit`);
  };

  const handleDeleteFromTable = async (resource: Resource) => {
    if (!confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteResource(resource.code);

      setResources((prev) => prev.filter((r) => r.id !== resource.id));
      setSuccessMessage('Resource deleted successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFromTable = async (resource: Resource) => {
    setLoading(true);
    setError(null);

    try {
      const updatedResource = await toggleResourceStatus(resource.code);

      setResources((prev) =>
        prev.map((r) => (r.id === updatedResource.id ? updatedResource : r)),
      );
      setSuccessMessage(
        `Resource ${updatedResource.isActive ? 'activated' : 'deactivated'} successfully`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
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

      {/* Resources Table */}
      <ResourceList
        resources={resources}
        onSelectResource={handleSelectResource}
        onEditResource={handleEditFromTable}
        onDeleteResource={handleDeleteFromTable}
        onToggleStatus={handleToggleFromTable}
        onCreateResource={handleStartCreate}
        loading={loading}
      />
    </div>
  );
}
