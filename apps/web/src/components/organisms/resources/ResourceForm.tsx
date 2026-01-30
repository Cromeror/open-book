'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, type ResourceFormData } from '@/lib/validations/resource.schema';
import type { Resource, ResourceCapability, CapabilityPreset } from '@/types/business';
import { CapabilityEditor } from './CapabilityEditor';
import { CapabilityPresetsQuickstart } from './CapabilityPresetsQuickstart';
import { Section } from '@/components/molecules';
import { Info } from 'lucide-react';

export interface ResourceFormProps {
  resource?: Resource | null;
  presets?: CapabilityPreset[];
  onSubmit: (data: ResourceFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-700';

/**
 * ResourceForm - Organism component
 *
 * Form for creating or editing HATEOAS resources.
 * Includes capability presets, inline capability editor, and URL preview.
 */
export function ResourceForm({ resource, presets = [], onSubmit, onCancel, loading = false }: ResourceFormProps) {
  const isEditMode = !!resource;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: resource
      ? {
        code: resource.code,
        name: resource.name,
        scope: resource.scope,
        baseUrl: resource.baseUrl,
        capabilities: resource.capabilities,
      }
      : {
        code: '',
        name: '',
        scope: 'global',
        baseUrl: '/api/',
        capabilities: [],
      },
  });

  const baseUrl = watch('baseUrl');
  const capabilities = watch('capabilities');

  const handlePresetSelect = useCallback(
    (presetCapabilities: ResourceCapability[]) => {
      setValue('capabilities', presetCapabilities, { shouldValidate: true });
    },
    [setValue],
  );

  const handleCapabilitiesChange = useCallback(
    (newCapabilities: ResourceFormData['capabilities']) => {
      setValue('capabilities', newCapabilities, { shouldValidate: true });
    },
    [setValue],
  );

  if (capabilities.length === 0 && presets.length > 0) {
    return (
      <CapabilityPresetsQuickstart
        presets={presets}
        onSelectPreset={handlePresetSelect}
        disabled={loading}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Section title='Basic Information' titlePrefix={<Info className="h-4 w-4 text-blue-500" />}>
        <div className="grid grid-cols-2 gap-4">
          {/* Code */}
          <div>
            <label className={labelClasses}>
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              disabled={isEditMode || loading}
              className={`${inputClasses} ${errors.code ? 'border-red-500' : ''}`}
              placeholder="goals"
            />
            {errors.code ? (
              <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Lowercase alphanumeric with underscores or hyphens
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className={labelClasses}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              disabled={loading}
              className={`${inputClasses} ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Objetivos de Recaudo"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Scope */}
          <div>
            <label className={labelClasses}>
              Scope <span className="text-red-500">*</span>
            </label>
            <select
              {...register('scope')}
              disabled={loading}
              className={`${inputClasses} ${errors.scope ? 'border-red-500' : ''}`}
            >
              <option value="global">Global</option>
              <option value="condominium">Condominium</option>
            </select>
            {errors.scope ? (
              <p className="mt-1 text-xs text-red-500">{errors.scope.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Global resources or condominium-scoped
              </p>
            )}
          </div>

          {/* Base URL */}
          <div>
            <label className={labelClasses}>
              Base URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('baseUrl')}
              disabled={loading}
              className={`${inputClasses} ${errors.baseUrl ? 'border-red-500' : ''} font-mono text-xs`}
              placeholder="/api/condominiums/{condominiumId}/goals"
            />
            {errors.baseUrl ? (
              <p className="mt-1 text-xs text-red-500">{errors.baseUrl.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Must start with /api/. Use placeholders like {'{condominiumId}'}
              </p>
            )}
          </div>
        </div>
      </Section>
      {/* Capabilities */}
      <div className="space-y-3">
        <CapabilityEditor
          capabilities={capabilities}
          onChange={handleCapabilitiesChange}
          baseUrl={baseUrl}
          disabled={loading}
        />
        {errors.capabilities && (
          <p className="text-xs text-red-500">{errors.capabilities.message}</p>
        )}
      </div>
    </form>
  );
}

export default ResourceForm;
