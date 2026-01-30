'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Resource } from '@/types/business';
import { deleteResource, toggleResourceStatus } from '@/lib/http-api/resources-api';
import { ResourceDetail } from '@/components/organisms/resources/ResourceDetail';

interface Props {
  resource: Resource;
}

export function ResourceDetailView({ resource: initialResource }: Props) {
  const router = useRouter();
  const [resource, setResource] = useState(initialResource);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    router.push(`/admin/resources/${resource.code}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteResource(resource.code);
      router.push('/admin/resources');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedResource = await toggleResourceStatus(resource.code);
      setResource(updatedResource);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <ResourceDetail
          resource={resource}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </div>
    </div>
  );
}
