import { SplitSquareHorizontal, Eye } from 'lucide-react';
import { Section } from '@/components/molecules';
import type { FieldErrors } from 'react-hook-form';
import type { WizardFormData } from './resource-create.schema';
import type { UrlSegment } from './url-segment.types';

export interface StepSegmentDefinitionProps {
  segments: UrlSegment[];
  templateUrl: string;
  parameterKeys: string[];
  errors: FieldErrors<WizardFormData>;
  loading: boolean;
  onSegmentToggle: (index: number, isDynamic: boolean) => void;
  onSegmentKeyChange: (index: number, parameterKey: string) => void;
}

export function StepSegmentDefinition({
  segments,
  templateUrl,
  parameterKeys,
  errors,
  loading,
  onSegmentToggle,
  onSegmentKeyChange,
}: StepSegmentDefinitionProps) {
  return (
    <>
      <Section
        title="Configuración de Segmentos"
        titlePrefix={<SplitSquareHorizontal className="h-4 w-4 text-blue-500" />}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Configure cada segmento de la URL. Marque los segmentos variables como dinámicos y seleccione una clave de parámetro.
          </p>

          <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm font-mono text-gray-500">
            <span>/api/</span>
          </div>

          {segments.length > 0 ? (
            <div className="space-y-2">
              {segments.map((segment: UrlSegment, index: number) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-md border p-3 ${
                    segment.isDynamic ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-36 shrink-0">
                    <code className="text-sm text-gray-700">{segment.originalValue}</code>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onSegmentToggle(index, false)}
                      className={`rounded-l-md px-3 py-1 text-xs font-medium transition-colors ${
                        !segment.isDynamic
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      Estático
                    </button>
                    <button
                      type="button"
                      onClick={() => onSegmentToggle(index, true)}
                      className={`rounded-r-md px-3 py-1 text-xs font-medium transition-colors ${
                        segment.isDynamic
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      Dinámico
                    </button>
                  </div>

                  {segment.isDynamic && (
                    <div className="flex-1">
                      <select
                        value={segment.parameterKey ?? ''}
                        onChange={(e) => onSegmentKeyChange(index, e.target.value)}
                        className="w-full rounded-md border border-blue-200 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccione clave de parámetro...</option>
                        {parameterKeys.map((key) => (
                          <option key={key} value={key}>
                            {`{${key}}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {segment.isDynamic && segment.parameterKey && (
                    <div className="shrink-0 text-xs text-blue-600 font-mono">
                      → {`{${segment.parameterKey}}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No hay segmentos. Verifique la URL del paso 1.</p>
          )}

          {errors.segments && (
            <p className="text-xs text-red-500">
              {typeof errors.segments === 'object' && 'message' in errors.segments
                ? (errors.segments.message as string)
                : 'Configuración de segmentos inválida'}
            </p>
          )}
        </div>
      </Section>

      {/* Template URL Preview */}
      {templateUrl && (
        <Section title="Vista Previa de URL" titlePrefix={<Eye className="h-4 w-4 text-blue-500" />}>
          <div className="rounded-md bg-gray-900 p-4">
            <code className="text-sm text-green-400 break-all">{templateUrl}</code>
          </div>
        </Section>
      )}
    </>
  );
}
