import { Link2 } from 'lucide-react';
import { publicEnv } from '@/config/env';
import { Section } from '@/components/molecules';
import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import type { WizardFormData } from './resource-create.schema';
import type { Integration } from '@/types/business/integration.types';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-700';

export interface StepRawUrlProps {
  register: UseFormRegister<WizardFormData>;
  watch: UseFormWatch<WizardFormData>;
  errors: FieldErrors<WizardFormData>;
  loading: boolean;
  integrations?: Integration[];
}

export function StepRawUrl({ register, watch, errors, loading, integrations = [] }: StepRawUrlProps) {
  const integrationId = watch('integrationId');
  const hasIntegration = !!integrationId;

  return (
    <>
      {integrations.length > 0 && (
        <Section title="Integracion">
          <div>
            <label className={labelClasses}>
              Integracion externa
            </label>
            <select
              {...register('integrationId')}
              disabled={loading}
              className={inputClasses}
            >
              <option value="">Sin integracion (API local)</option>
              {integrations.map((integration) => (
                <option key={integration.id} value={integration.id}>
                  {integration.name} — {integration.baseUrl}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Si selecciona una integracion, la URL del recurso sera relativa a la URL base de la integracion.
            </p>
          </div>

          {hasIntegration && (
            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('requiresExternalAuth')}
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Restringir este recurso por roles/permisos
                </span>
              </label>
              <p className="mt-1 ml-6 text-xs text-gray-500">
                Si se activa, el acceso a este recurso sera controlado por el sistema de permisos de {publicEnv.NEXT_PUBLIC_APP_NAME} para usuarios del sistema externo.
              </p>
            </div>
          )}
        </Section>
      )}

      <Section title="URL Base" titlePrefix={<Link2 className="h-4 w-4 text-blue-500" />}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Pegue una URL real de su API. Los segmentos dinámicos (IDs, UUIDs) se detectarán automáticamente.
          </p>
          <div>
            <label className={labelClasses}>
              URL <span className="text-red-500">*</span>
            </label>
            <div className={`mt-1 flex rounded-md border shadow-sm focus-within:ring-1 ${errors.rawUrl ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500'}`}>
              <span className="inline-flex items-center rounded-l-md border-r border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-400 font-mono select-none whitespace-nowrap">
                http://dominio/
              </span>
              <input
                type="text"
                {...register('rawUrl')}
                disabled={loading}
                className="block w-full rounded-r-md px-3 py-2 text-sm font-mono text-xs focus:outline-none disabled:bg-gray-100"
                placeholder="condominiums/{id}/goals/:goalId"
              />
            </div>
            {errors.rawUrl ? (
              <p className="mt-1 text-xs text-red-500">{errors.rawUrl.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Sin slash inicial. Use <code className="bg-gray-100 px-1 rounded">{'{variable}'}</code> o <code className="bg-gray-100 px-1 rounded">:variable</code> para segmentos dinámicos.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Detalles del Recurso">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              disabled={loading}
              className={`${inputClasses} ${errors.code ? 'border-red-500' : ''}`}
              placeholder="goals"
            />
            {errors.code ? (
              <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Derivado automáticamente de la URL. Alfanumérico en minúsculas.
              </p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              Nombre <span className="text-red-500">*</span>
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
            Descripción
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
    </>
  );
}
