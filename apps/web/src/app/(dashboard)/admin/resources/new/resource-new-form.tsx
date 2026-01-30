'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResourceFormData } from '@/lib/validations/resource.schema';
import type { CapabilityPreset } from '@/types/business';
import { createResource, type CreateResourceDto } from '@/lib/http-api/resources-api';
import { ResourceForm } from '@/components/organisms/resources/ResourceForm';

interface ResourceNewFormProps {
  presets?: CapabilityPreset[];
}

export function ResourceNewForm({ presets = [] }: ResourceNewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ResourceFormData) => {
    setLoading(true);
    setError(null);

    try {
      const dto: CreateResourceDto = {
        code: formData.code,
        name: formData.name,
        scope: formData.scope,
        baseUrl: formData.baseUrl,
        capabilities: formData.capabilities,
      };

      await createResource(dto);

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
        presets={presets}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
