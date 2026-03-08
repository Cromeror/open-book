'use client';

import type { Resource, CapabilityPreset } from '@/types/business';
import type { Integration } from '@/types/business/integration.types';
import type { ResourceFormData } from '@/lib/validations/resource.schema';
import { ResourceEditView } from './ResourceEditView';
import { ResourceCreateView } from './ResourceCreateView';

export interface ResourceFormProps {
  resource?: Resource | null;
  presets?: CapabilityPreset[];
  /** All resources for HATEOAS link target dropdowns (edit mode only) */
  allResources?: Resource[];
  /** Available integrations for the integration selector */
  integrations?: Integration[];
  onSubmit: (data: ResourceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ResourceForm({ resource, presets = [], allResources = [], integrations = [], onSubmit, onCancel, loading = false }: ResourceFormProps) {
  if (resource) {
    return (
      <ResourceEditView
        resource={resource}
        allResources={allResources}
        integrations={integrations}
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
      integrations={integrations}
    />
  );
}

export default ResourceForm;
