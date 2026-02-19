'use client';

import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Section } from '@/components/molecules';
import { resourceFormSchema, type ResourceFormData } from '@/lib/validations/resource.schema';
import type { MethodConfig } from './resource-create.schema';
import { StepMethodConfig } from './StepMethodConfig';
import {
  resourceHttpMethodsToMethodConfigs,
  methodConfigsToSubmitHttpMethods,
} from './utils';
import type { ResourceFormProps } from './ResourceForm';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-700';

export function ResourceEditView({
  resource,
  onSubmit,
  onCancel,
  loading = false,
}: Required<Pick<ResourceFormProps, 'resource'>> & Omit<ResourceFormProps, 'resource'>) {
  const [methodConfigs, setMethodConfigs] = useState<MethodConfig[]>(
    () => resourceHttpMethodsToMethodConfigs(resource!.httpMethods) as MethodConfig[],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      code: resource!.code,
      name: resource!.name,
      scope: resource!.scope,
      templateUrl: resource!.templateUrl,
      httpMethods: resource!.httpMethods,
    },
  });

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

  const methodError = useMemo(() => {
    const hasEnabled = methodConfigs.some((c) => c.enabled);
    return hasEnabled ? null : 'Seleccione al menos un método HTTP';
  }, [methodConfigs]);

  const onFormSubmit = handleSubmit((formData) => {
    if (methodError) return;
    const httpMethods = methodConfigsToSubmitHttpMethods(methodConfigs);
    const submitData: ResourceFormData = {
      code: formData.code,
      name: formData.name,
      scope: formData.scope,
      templateUrl: formData.templateUrl,
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
              Code <span className="text-red-500">*</span>
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
            {errors.scope && <p className="mt-1 text-xs text-red-500">{errors.scope.message}</p>}
          </div>

          <div>
            <label className={labelClasses}>
              Template URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('templateUrl')}
              disabled={loading}
              className={`${inputClasses} ${errors.templateUrl ? 'border-red-500' : ''} font-mono text-xs`}
              placeholder="/api/condominiums/{condominiumId}/goals"
            />
            {errors.templateUrl ? (
              <p className="mt-1 text-xs text-red-500">{errors.templateUrl.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Must start with /api/. Use placeholders like {'{condominiumId}'}
              </p>
            )}
          </div>
        </div>
      </Section>

      <StepMethodConfig
        methodConfigs={methodConfigs}
        loading={loading}
        onToggle={handleMethodToggle}
        onConfigChange={handleMethodConfigChange}
      />
      {methodError && (
        <p className="text-xs text-red-500">{methodError}</p>
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
