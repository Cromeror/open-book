import { Link2 } from 'lucide-react';
import { Section } from '@/components/molecules';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { WizardFormData } from './resource-create.schema';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-700';

export interface StepRawUrlProps {
  register: UseFormRegister<WizardFormData>;
  errors: FieldErrors<WizardFormData>;
  loading: boolean;
}

export function StepRawUrl({ register, errors, loading }: StepRawUrlProps) {
  return (
    <>
      <Section title="URL Base" titlePrefix={<Link2 className="h-4 w-4 text-blue-500" />}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Pegue una URL real de su API. Los segmentos dinámicos (IDs, UUIDs) se detectarán automáticamente.
          </p>
          <div>
            <label className={labelClasses}>
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('rawUrl')}
              disabled={loading}
              className={`${inputClasses} font-mono text-xs ${errors.rawUrl ? 'border-red-500' : ''}`}
              placeholder="/api/condominiums/abc-123/goals/xyz-456"
            />
            {errors.rawUrl ? (
              <p className="mt-1 text-xs text-red-500">{errors.rawUrl.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Debe comenzar con /api/. Ejemplo: /api/condominiums/abc-123/goals/xyz-456
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

          <div>
            <label className={labelClasses}>
              Alcance <span className="text-red-500">*</span>
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
        </div>
      </Section>
    </>
  );
}
