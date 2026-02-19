import { Settings2 } from 'lucide-react';
import { Section } from '@/components/molecules';
import type { FieldErrors } from 'react-hook-form';
import type { WizardFormData, MethodConfig } from './resource-create.schema';
import { MethodConfigCard } from './MethodConfigCard';

export interface StepMethodConfigProps {
  methodConfigs: MethodConfig[];
  errors?: FieldErrors<WizardFormData>;
  loading: boolean;
  onToggle: (index: number) => void;
  onConfigChange: (index: number, field: 'payloadMetadata' | 'responseMetadata', value: string) => void;
}

export function StepMethodConfig({
  methodConfigs,
  errors,
  loading,
  onToggle,
  onConfigChange,
}: StepMethodConfigProps) {
  return (
    <Section title="Configuración de Métodos" titlePrefix={<Settings2 className="h-4 w-4 text-blue-500" />}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Seleccione los métodos HTTP que soporta este recurso. Use el botón &quot;Configurar&quot; para definir el payload y schema.
        </p>

        <div className="space-y-3">
          {methodConfigs.map((config, index) => (
            <MethodConfigCard
              key={config.method}
              config={config}
              loading={loading}
              onToggle={() => onToggle(index)}
              onConfigChange={(field, value) => onConfigChange(index, field, value)}
            />
          ))}
        </div>

        {errors?.methodConfigs && (
          <p className="text-xs text-red-500">
            {typeof errors.methodConfigs === 'object' && 'root' in errors.methodConfigs
              ? (errors.methodConfigs.root?.message as string)
              : typeof errors.methodConfigs === 'object' && 'message' in errors.methodConfigs
                ? (errors.methodConfigs.message as string)
                : 'Seleccione al menos un método HTTP'}
          </p>
        )}
      </div>
    </Section>
  );
}
