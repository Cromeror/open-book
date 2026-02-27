import { Settings2 } from 'lucide-react';
import { Section } from '@/components/molecules';
import type { FieldErrors } from 'react-hook-form';
import type { WizardFormData, MethodConfig } from './resource-create.schema';
import { MethodConfigCard } from './MethodConfigCard';
import type { Resource, ResourceHttpMethodLink } from '@/types/business';

export interface StepMethodConfigProps {
  methodConfigs: MethodConfig[];
  errors?: FieldErrors<WizardFormData>;
  loading: boolean;
  onToggle: (index: number) => void;
  onConfigChange: (index: number, field: 'payloadMetadata' | 'responseMetadata', value: string) => void;
  /** outboundLinks keyed by HTTP method string (e.g. 'GET'). Only used in edit mode. */
  outboundLinksByMethod?: Record<string, ResourceHttpMethodLink[]>;
  /** sourceMethodId (resource_http_methods UUID) keyed by HTTP method. Only used in edit mode. */
  sourceMethodIdByMethod?: Record<string, string | undefined>;
  /** All resources for link target dropdowns. Only used in edit mode. */
  allResources?: Resource[];
  /** Called when links change for a method. Only used in edit mode. */
  onLinksChange?: (method: string, links: ResourceHttpMethodLink[]) => void;
}

export function StepMethodConfig({
  methodConfigs,
  errors,
  loading,
  onToggle,
  onConfigChange,
  outboundLinksByMethod,
  sourceMethodIdByMethod,
  allResources,
  onLinksChange,
}: StepMethodConfigProps) {
  return (
    <Section title="Configurar métodos HTTP" titlePrefix={<Settings2 className="h-4 w-4 text-blue-500" />}>
      <div className="space-y-4">
        <div className="space-y-3">
          {methodConfigs.map((config, index) => (
            <MethodConfigCard
              key={config.method}
              config={config}
              loading={loading}
              onToggle={() => onToggle(index)}
              onConfigChange={(field, value) => onConfigChange(index, field, value)}
              sourceMethodId={sourceMethodIdByMethod?.[config.method]}
              outboundLinks={outboundLinksByMethod?.[config.method]}
              allResources={allResources}
              onLinksChange={
                onLinksChange
                  ? (links) => onLinksChange(config.method, links)
                  : undefined
              }
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
