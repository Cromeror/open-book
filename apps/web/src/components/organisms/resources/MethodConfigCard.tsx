import { useState } from 'react';
import { Check, Settings, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { MethodConfig } from './resource-create.schema';
import type { HttpMethod } from '@/types/business';
import { validatePayloadMetadata, validateResponseMetadata } from './metadata.schema';
import { JsonField } from './JsonField';

const METHOD_STYLES: Record<HttpMethod, { color: string }> = {
  GET: { color: 'bg-green-100 text-green-700 border-green-300' },
  POST: { color: 'bg-blue-100 text-blue-700 border-blue-300' },
  PATCH: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  DELETE: { color: 'bg-red-100 text-red-700 border-red-300' },
  PUT: { color: 'bg-purple-100 text-purple-700 border-purple-300' },
};

export interface MethodConfigCardProps {
  config: MethodConfig;
  loading: boolean;
  onToggle: () => void;
  onConfigChange: (field: 'payloadMetadata' | 'responseMetadata', value: string) => void;
}

export function MethodConfigCard({
  config,
  loading,
  onToggle,
  onConfigChange,
}: MethodConfigCardProps) {
  const [showConfig, setShowConfig] = useState(false);
  const style = METHOD_STYLES[config.method];

  const hasErrors =
    validatePayloadMetadata(config.payloadMetadata ?? '') !== null ||
    validateResponseMetadata(config.responseMetadata ?? '') !== null;

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      {/* Header: checkbox + method name + configure button */}
      <div
        className={`flex items-center justify-between px-4 py-3 transition-colors ${
          config.enabled ? style.color : 'bg-white'
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          className="flex items-center gap-3 text-left"
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded border ${
              config.enabled
                ? 'border-current bg-current/20'
                : 'border-gray-300 bg-white'
            }`}
          >
            {config.enabled && <Check className="h-3 w-3" />}
          </div>
          <span className={`text-sm font-semibold ${!config.enabled ? 'text-gray-400' : ''}`}>
            {config.method}
          </span>
        </button>

        {config.enabled && (
          <div className="flex items-center gap-2">
            {showConfig && hasErrors && (
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            )}
            <button
              type="button"
              onClick={() => setShowConfig((s) => !s)}
              disabled={loading}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-black/5"
            >
              <Settings className="h-3.5 w-3.5" />
              Configurar
              {showConfig ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Config panel */}
      {config.enabled && showConfig && (
        <div className="space-y-3 border-t bg-gray-50 p-4">
          <JsonField
            label="Payload Metadata (JSON)"
            value={config.payloadMetadata ?? ''}
            onChange={(v) => onConfigChange('payloadMetadata', v)}
            validate={validatePayloadMetadata}
            disabled={loading}
            placeholder='{ "method": "POST", "summary": "...", "requestBody": { ... } }'
          />
          <JsonField
            label="Response Metadata (JSON)"
            value={config.responseMetadata ?? ''}
            onChange={(v) => onConfigChange('responseMetadata', v)}
            validate={validateResponseMetadata}
            disabled={loading}
            placeholder='{ "method": "GET", "success": { "statusCode": 200, "contentType": "application/json", "schema": { ... } } }'
          />
        </div>
      )}
    </div>
  );
}
