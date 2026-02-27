'use client';

import type { Resource, CapabilityPreset } from '@/types/business';
import type { ResourceFormData } from '@/lib/validations/resource.schema';
import { ResourceEditView } from './ResourceEditView';
import { ResourceCreateView } from './ResourceCreateView';

export interface ResourceFormProps {
  resource?: Resource | null;
  presets?: CapabilityPreset[];
  /** All resources for HATEOAS link target dropdowns (edit mode only) */
  allResources?: Resource[];
  onSubmit: (data: ResourceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ResourceForm({ resource, presets = [], allResources = [], onSubmit, onCancel, loading = false }: ResourceFormProps) {
  if (resource) {
    return (
      <ResourceEditView
        resource={resource}
        allResources={allResources}
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
