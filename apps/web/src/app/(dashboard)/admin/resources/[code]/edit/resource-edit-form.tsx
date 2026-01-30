'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Resource } from '@/types/business';
import { ResourceFormData } from '@/lib/validations/resource.schema';
import { updateResource } from '@/lib/http-api/resources-api';
import { ResourceForm } from '@/components/organisms/resources/ResourceForm';
import type { GrpcCapabilityPreset } from '@/lib/grpc/types';

interface Props {
  resource: Resource;
  presets?: GrpcCapabilityPreset[];
}

export function ResourceEditForm({ resource, presets = [] }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ResourceFormData) => {
    setLoading(true);
    setError(null);

    try {
      await updateResource(resource.code, {
        name: formData.name,
        scope: formData.scope,
        baseUrl: formData.baseUrl,
        capabilities: formData.capabilities,
      });

      router.push('/admin/resources');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/resources');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <ResourceForm
        resource={resource}
        presets={presets}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
