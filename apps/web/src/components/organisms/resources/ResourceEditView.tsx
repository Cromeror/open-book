'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Section } from '@/components/molecules';
import { resourceFormSchema, type ResourceFormData } from '@/lib/validations/resource.schema';
import type { MethodConfig } from './resource-create.schema';
import { StepMethodConfig } from './StepMethodConfig';
import { StepSegmentDefinition } from './StepSegmentDefinition';
import {
  resourceHttpMethodsToMethodConfigs,
  methodConfigsToSubmitHttpMethods,
  parseUrlIntoSegments,
  buildTemplateUrl,
} from './utils';
import { PARAMETER_KEYS } from './url-segment.types';
import type { UrlSegment } from './url-segment.types';
import type { ResourceFormProps } from './ResourceForm';
import type { Resource, ResourceHttpMethodLink } from '@/types/business';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-700';

interface ResourceEditViewProps extends Omit<ResourceFormProps, 'resource'> {
  resource: Resource;
  /** All resources for HATEOAS link target dropdowns */
  allResources?: Resource[];
}

export function ResourceEditView({
  resource,
  allResources = [],
  onSubmit,
  onCancel,
  loading = false,
}: ResourceEditViewProps) {
  const [methodConfigs, setMethodConfigs] = useState<MethodConfig[]>(
    () => resourceHttpMethodsToMethodConfigs(resource.httpMethods) as MethodConfig[],
  );

  const [segments, setSegments] = useState<UrlSegment[]>(
    () => parseUrlIntoSegments(resource.templateUrl),
  );

  // outboundLinks keyed by HTTP method (GET, POST, etc.)
  const [outboundLinksByMethod, setOutboundLinksByMethod] = useState<
    Record<string, ResourceHttpMethodLink[]>
  >(() => {
    const initial: Record<string, ResourceHttpMethodLink[]> = {};
    for (const hm of resource.httpMethods ?? []) {
      initial[hm.method] = (hm.outboundLinks ?? []).map((l) => ({
        id: l.id,
        rel: l.rel,
        targetHttpMethodId: l.targetHttpMethodId,
        paramMappings: l.paramMappings,
      }));
    }
    return initial;
  });

  // sourceMethodId keyed by HTTP method — the UUID of the resource_http_methods row
  const sourceMethodIdByMethod = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const hm of resource.httpMethods ?? []) {
      map[hm.method] = hm.id;
    }
    return map;
  }, [resource.httpMethods]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      code: resource.code,
      name: resource.name,
      description: resource.description ?? '',
      templateUrl: resource.templateUrl,
      httpMethods: resource.httpMethods,
    },
  });

  // Rebuild templateUrl from segments and sync to form
  const templateUrl = useMemo(() => {
    if (segments.length === 0) return resource.templateUrl;
    return buildTemplateUrl(segments);
  }, [segments, resource]);

  useEffect(() => {
    setValue('templateUrl', templateUrl);
  }, [templateUrl, setValue]);

  // Segment handlers
  const handleSegmentToggle = useCallback(
    (index: number, isDynamic: boolean) => {
      setSegments((prev) =>
        prev.map((seg, i) =>
          i === index ? { ...seg, isDynamic, parameterKey: isDynamic ? seg.parameterKey : null } : seg,
        ),
      );
    },
    [],
  );

  const handleSegmentKeyChange = useCallback(
    (index: number, parameterKey: string) => {
      setSegments((prev) =>
        prev.map((seg, i) => (i === index ? { ...seg, parameterKey } : seg)),
      );
    },
    [],
  );

  // Method handlers
  const handleMethodToggle = useCallback((index: number) => {
    setMethodConfigs((prev) =>
      prev.map((c, i) => (i === index ? { ...c, enabled: !c.enabled } : c)),
    );
  }, []);

  const handleMethodConfigChange = useCallback(
    (index: number, field: 'payloadMetadata' | 'responseMetadata', value: string) => {
      setMethodConfigs((prev) =>
        prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
      );
    },
    [],
  );

  const handleLinksChange = useCallback(
    (method: string, links: ResourceHttpMethodLink[]) => {
      setOutboundLinksByMethod((prev) => ({ ...prev, [method]: links }));
    },
    [],
  );

  const methodError = useMemo(() => {
    const hasEnabled = methodConfigs.some((c) => c.enabled);
    return hasEnabled ? null : 'Seleccione al menos un método HTTP';
  }, [methodConfigs]);

  const segmentError = useMemo(() => {
    const invalidDynamic = segments.some((s) => s.isDynamic && (!s.parameterKey || s.parameterKey === ''));
    return invalidDynamic ? 'Todos los segmentos dinámicos deben tener una clave de parámetro' : null;
  }, [segments]);

  const onFormSubmit = handleSubmit((formData) => {
    if (methodError || segmentError) return;

    const httpMethods = methodConfigsToSubmitHttpMethods(methodConfigs).map((hm) => ({
      ...hm,
      id: sourceMethodIdByMethod[hm.method],
      outboundLinks: outboundLinksByMethod[hm.method] ?? [],
    }));

    const submitData: ResourceFormData = {
      code: formData.code,
      name: formData.name,
      description: formData.description || null,
      templateUrl,
      httpMethods,
    };
    onSubmit(submitData);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <Section title="Basic Information" titlePrefix={<Info className="h-4 w-4 text-blue-500" />}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>
              Código del recurso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              disabled
              className={`${inputClasses} ${errors.code ? 'border-red-500' : ''}`}
              placeholder="goals"
            />
            {errors.code ? (
              <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Code cannot be changed</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              Nombre del recurso <span className="text-red-500">*</span>
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

        <div className="mt-3">
          <label className={labelClasses}>
            Template URL
          </label>
          <input
            type="text"
            value={templateUrl}
            disabled
            className={`${inputClasses} font-mono text-xs bg-gray-50`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Generated from segment configuration below
          </p>
        </div>

        <div className="mt-3">
          <label className={labelClasses}>
            Descripción (Opcional)
          </label>
          <textarea
            {...register('description')}
            disabled={loading}
            rows={2}
            className={`${inputClasses} resize-none ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Descripción opcional del recurso..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>
      </Section>

      <StepMethodConfig
        methodConfigs={methodConfigs}
        loading={loading}
        onToggle={handleMethodToggle}
        onConfigChange={handleMethodConfigChange}
        outboundLinksByMethod={outboundLinksByMethod}
        sourceMethodIdByMethod={sourceMethodIdByMethod}
        allResources={allResources}
        onLinksChange={handleLinksChange}
      />
      {methodError && (
        <p className="text-xs text-red-500">{methodError}</p>
      )}

      <StepSegmentDefinition
        segments={segments}
        templateUrl={templateUrl}
        parameterKeys={[...PARAMETER_KEYS]}
        errors={{}}
        loading={loading}
        onSegmentToggle={handleSegmentToggle}
        onSegmentKeyChange={handleSegmentKeyChange}
      />
      {segmentError && (
        <p className="text-xs text-red-500">{segmentError}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="success" icon="Check" type="submit" loading={loading}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
