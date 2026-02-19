'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { Button } from '@/components/atoms';
import { type ResourceFormData } from '@/lib/validations/resource.schema';
import { wizardFormSchema, STEP_FIELDS, type WizardFormData, type MethodConfig } from './resource-create.schema';
import type { HttpMethod } from '@/types/business';
import {
  parseUrlIntoSegments,
  buildTemplateUrl,
  deriveResourceCode,
  detectScope,
  generateDefaultHttpMethods,
  extractResponsePropertyKeys,
} from './utils';
import type { ResourceFormProps } from './ResourceForm';
import { StepRawUrl } from './StepRawUrl';
import { StepMethodConfig } from './StepMethodConfig';
import { StepSegmentDefinition } from './StepSegmentDefinition';

const ALL_METHODS: HttpMethod[] = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];

const DEFAULT_METHOD_CONFIGS: MethodConfig[] = ALL_METHODS.map((method) => ({
  method,
  enabled: false,
  payloadMetadata: '',
  responseMetadata: '',
}));

const STEP_LABELS = ['URL Base', 'Métodos HTTP', 'Segmentos'];

export function ResourceCreateView({
  onSubmit,
  onCancel,
  loading = false,
}: Pick<ResourceFormProps, 'onSubmit' | 'onCancel' | 'loading'>) {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<WizardFormData>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues: {
      rawUrl: '/api/',
      methodConfigs: DEFAULT_METHOD_CONFIGS,
      segments: [],
      code: '',
      name: '',
      scope: 'global',
    },
  });

  const rawUrl = watch('rawUrl');
  const methodConfigs = watch('methodConfigs');
  const segments = watch('segments');
  const code = watch('code');
  const name = watch('name');
  const scope = watch('scope');

  // Auto-parse URL into segments as user types
  useEffect(() => {
    if (!rawUrl || rawUrl === '/api/' || rawUrl === '/api') {
      setValue('segments', []);
      return;
    }
    const parsed = parseUrlIntoSegments(rawUrl);
    setValue('segments', parsed, { shouldValidate: false });
  }, [rawUrl, setValue]);

  // Auto-derive code and scope from segments
  useEffect(() => {
    if (segments.length === 0) return;
    const derivedCode = deriveResourceCode(segments);
    const derivedScope = detectScope(segments);
    if (!code || code === derivedCode) setValue('code', derivedCode);
    setValue('scope', derivedScope);
  }, [segments, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const templateUrl = useMemo(() => {
    if (segments.length === 0) return '';
    return buildTemplateUrl(segments);
  }, [segments]);

  // Extract property keys from response metadata for dynamic segment options
  const dynamicParameterKeys = useMemo(
    () => extractResponsePropertyKeys(methodConfigs),
    [methodConfigs],
  );

  // Navigation
  const handleNext = useCallback(async () => {
    const fields = STEP_FIELDS[currentStep];
    const isValid = await trigger(fields);
    if (isValid) setCurrentStep((s) => Math.min(s + 1, 2));
  }, [currentStep, trigger]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // Final submit
  const handleFinalSubmit = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const httpMethods = generateDefaultHttpMethods(methodConfigs);

    const formData: ResourceFormData = {
      code,
      name,
      scope,
      templateUrl,
      httpMethods,
    };

    onSubmit(formData);
  }, [trigger, methodConfigs, code, name, scope, templateUrl, onSubmit]);

  // Step 2 handlers
  const handleMethodToggle = useCallback(
    (index: number) => {
      const updated = methodConfigs.map((c, i) =>
        i === index ? { ...c, enabled: !c.enabled } : c,
      );
      setValue('methodConfigs', updated, { shouldValidate: true });
    },
    [methodConfigs, setValue],
  );

  const handleMethodConfigChange = useCallback(
    (index: number, field: 'payloadMetadata' | 'responseMetadata', value: string) => {
      const updated = methodConfigs.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      );
      setValue('methodConfigs', updated);
    },
    [methodConfigs, setValue],
  );

  // Step 3 handlers
  const handleSegmentToggle = useCallback(
    (index: number, isDynamic: boolean) => {
      const updated = segments.map((seg, i) =>
        i === index ? { ...seg, isDynamic, parameterKey: isDynamic ? seg.parameterKey : null } : seg,
      );
      setValue('segments', updated, { shouldValidate: true });
    },
    [segments, setValue],
  );

  const handleSegmentKeyChange = useCallback(
    (index: number, parameterKey: string) => {
      const updated = segments.map((seg, i) => (i === index ? { ...seg, parameterKey } : seg));
      setValue('segments', updated, { shouldValidate: true });
    },
    [segments, setValue],
  );

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < currentStep
                    ? 'bg-green-500 text-white'
                    : i === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm ${
                  i === currentStep ? 'font-medium text-gray-900' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-12 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      {currentStep === 0 && (
        <StepRawUrl register={register} errors={errors} loading={loading} />
      )}

      {currentStep === 1 && (
        <StepMethodConfig
          methodConfigs={methodConfigs}
          errors={errors}
          loading={loading}
          onToggle={handleMethodToggle}
          onConfigChange={handleMethodConfigChange}
        />
      )}

      {currentStep === 2 && (
        <StepSegmentDefinition
          segments={segments}
          templateUrl={templateUrl}
          parameterKeys={dynamicParameterKeys}
          errors={errors}
          loading={loading}
          onSegmentToggle={handleSegmentToggle}
          onSegmentKeyChange={handleSegmentKeyChange}
        />
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between border-t border-gray-200 pt-4">
        {currentStep === 0 ? (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        ) : (
          <Button variant="secondary" onClick={handlePrev} disabled={loading}>
            Anterior
          </Button>
        )}

        {currentStep < 2 ? (
          <Button variant="primary" onClick={handleNext} disabled={loading}>
            Siguiente
          </Button>
        ) : (
          <Button variant="success" icon="Check" onClick={handleFinalSubmit} loading={loading}>
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
}
