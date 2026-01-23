'use client';

import { ResourceCapability } from '@/types/resources';
import { InfoIcon } from 'lucide-react';

export interface UrlPreviewProps {
  baseUrl: string;
  capabilities: ResourceCapability[];
}

/**
 * UrlPreview - Component for showing interpolated URL examples
 *
 * Takes baseUrl and capabilities and shows concrete examples
 * with sample IDs to help users understand the final URLs
 */
export function UrlPreview({ baseUrl, capabilities }: UrlPreviewProps) {
  const interpolateUrl = (template: string, urlPattern: string): string => {
    // Sample values for interpolation
    const sampleValues: Record<string, string> = {
      '{condominiumId}': 'abc-123',
      '{id}': 'xyz-456',
      '{propertyId}': 'prop-789',
    };

    // First interpolate the baseUrl
    let result = template;
    Object.entries(sampleValues).forEach(([placeholder, value]) => {
      result = result.replace(placeholder, value);
    });

    // Then append the urlPattern (also interpolated)
    let pattern = urlPattern;
    Object.entries(sampleValues).forEach(([placeholder, value]) => {
      pattern = pattern.replace(placeholder, value);
    });

    return result + pattern;
  };

  if (!baseUrl || capabilities.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 p-4">
        <div className="flex items-start gap-2">
          <InfoIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">URL Preview</p>
            <p className="text-xs text-gray-500 mt-1">
              Configure base URL and capabilities to see URL examples
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-2 mb-3">
        <InfoIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-900">URL Preview</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Examples with sample IDs (condominiumId: abc-123, id: xyz-456)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {capabilities.map((capability, index) => {
          if (!capability.name) return null;

          const fullUrl = interpolateUrl(baseUrl, capability.urlPattern);

          return (
            <div key={index} className="rounded bg-white border border-gray-200 p-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {capability.name}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        capability.method === 'GET'
                          ? 'bg-green-100 text-green-700'
                          : capability.method === 'POST'
                            ? 'bg-blue-100 text-blue-700'
                            : capability.method === 'PATCH'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {capability.method}
                    </span>
                  </div>
                  <code className="text-xs text-gray-600 break-all">{fullUrl}</code>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UrlPreview;
