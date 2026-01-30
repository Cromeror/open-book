'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, type ResourceFormData } from '@/lib/validations/resource.schema';
import type { Resource, ResourceCapability, CapabilityPreset } from '@/types/business';
import { CapabilityEditor } from './CapabilityEditor';
import { CapabilityPresetsQuickstart } from './CapabilityPresetsQuickstart';
import { UrlPreview } from './UrlPreview';
import { Section } from '@/components/molecules';
import { Info, Puzzle } from 'lucide-react';

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

  const code = watch('code');
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
      {/* Basic Information */}
      <Section title='Basic Information' titlePrefix={<Info className="h-4 w-4" />}>
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
      <Section title='Capabilities' titlePrefix={<Puzzle className="h-4 w-4" />}>
        {/* Quickstart Presets - Only show when no capabilities */}
        {capabilities.length === 0 && presets.length > 0 && (
          <CapabilityPresetsQuickstart
            presets={presets}
            onSelectPreset={handlePresetSelect}
            disabled={loading}
          />
        )}

        {/* Capability Editor */}
        <div className="space-y-3">
          <CapabilityEditor
            capabilities={capabilities}
            onChange={handleCapabilitiesChange}
            resourceCode={code}
            disabled={loading}
          />
          {errors.capabilities && (
            <p className="text-xs text-red-500">{errors.capabilities.message}</p>
          )}
        </div>

        {/* URL Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">URL Preview</h3>
          <UrlPreview baseUrl={baseUrl} capabilities={capabilities} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>
      </Section>
    </form>
  );
}

export default ResourceForm;
