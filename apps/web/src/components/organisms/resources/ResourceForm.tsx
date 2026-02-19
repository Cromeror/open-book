'use client';

import type { Resource, CapabilityPreset } from '@/types/business';
import type { ResourceFormData } from '@/lib/validations/resource.schema';
import { ResourceEditView } from './ResourceEditView';
import { ResourceCreateView } from './ResourceCreateView';

export interface ResourceFormProps {
  resource?: Resource | null;
  presets?: CapabilityPreset[];
  onSubmit: (data: ResourceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ResourceForm({ resource, presets = [], onSubmit, onCancel, loading = false }: ResourceFormProps) {
  if (resource) {
    return (
      <ResourceEditView
        resource={resource}
        presets={presets}
        onSubmit={onSubmit}
        onCancel={onCancel}
        loading={loading}
      />
    );
  }

  return (
    <ResourceCreateView
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
    />
  );
}

export default ResourceForm;
