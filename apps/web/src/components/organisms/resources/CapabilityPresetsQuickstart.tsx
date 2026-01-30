'use client';

import { Zap } from 'lucide-react';
import type { CapabilityPreset, ResourceCapability } from '@/types/business';

export interface CapabilityPresetsQuickstartProps {
  presets: CapabilityPreset[];
  onSelectPreset: (capabilities: ResourceCapability[]) => void;
  disabled?: boolean;
}

/**
 * CapabilityPresetsQuickstart - Component for selecting capability presets
 *
 * Displays presets as quickstart options for resource configuration.
 * Presets should be fetched via gRPC from a Server Component and passed as props.
 * Only shown when a resource has no capabilities defined.
 */
export function CapabilityPresetsQuickstart({
  presets,
  onSelectPreset,
  disabled = false,
}: CapabilityPresetsQuickstartProps) {
  const handlePresetClick = (preset: CapabilityPreset) => {
    const capabilities: ResourceCapability[] = preset.capabilities.map((cap) => ({
      name: cap.name,
      method: cap.method,
      urlPattern: cap.urlPattern,
    }));
    onSelectPreset(capabilities);
  };

  if (presets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-medium text-blue-900">Quickstart</h4>
      </div>
      <p className="text-xs text-blue-700 mb-3">
        Select a preset to quickly configure capabilities for this resource.
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset)}
            disabled={disabled}
            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm hover:bg-blue-50 disabled:opacity-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">{preset.label}</div>
            {preset.description && (
              <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
