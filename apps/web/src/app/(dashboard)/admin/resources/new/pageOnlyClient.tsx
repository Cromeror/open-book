'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ResourceFormData } from '@/lib/validations/resource.schema';
import { createResourceWithMethods } from '@/lib/resource.actions';
import { ResourceForm } from '@/components/organisms/resources/ResourceForm';

export function PageOnlyClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ResourceFormData) => {
    setLoading(true);
    setError(null);

    const result = await createResourceWithMethods(formData);

    if (result.success) {
      router.push('/admin/resources');
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoading(false);
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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
