'use client';

import { useState, useMemo } from 'react';
import { Zap, Search } from 'lucide-react';
import type { CapabilityPreset, ResourceHttpMethod } from '@/types/business';

export interface CapabilityPresetsQuickstartProps {
  presets: CapabilityPreset[];
  onSelectPreset: (httpMethods: ResourceHttpMethod[]) => void;
  disabled?: boolean;
}

export function CapabilityPresetsQuickstart({
  presets,
  onSelectPreset,
  disabled = false,
}: CapabilityPresetsQuickstartProps) {
  const [search, setSearch] = useState('');

  const filteredPresets = useMemo(() => {
    if (!search.trim()) return presets;
    const query = search.toLowerCase();
    return presets.filter(
      (preset) =>
        preset.label.toLowerCase().includes(query) ||
        preset.description?.toLowerCase().includes(query) ||
        preset.capabilities.some(
          (cap) => cap.name.toLowerCase().includes(query) || cap.method.toLowerCase().includes(query),
        ),
    );
  }, [presets, search]);

  const handlePresetClick = (preset: CapabilityPreset) => {
    const methods: ResourceHttpMethod[] = preset.capabilities.map((cap) => ({
      name: cap.name,
      method: cap.method,
      urlPattern: cap.urlPattern,
    }));
    onSelectPreset(methods);
  };

  if (presets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between gap-4 mb-1">
        <div className="flex items-center gap-2 text-gray-950">
          <Zap className="h-6 w-6 text-blue-500" />
          <h4 className="text-xl font-medium">Quickstart</h4>
        </div>
        {presets.length > 3 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search presets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-blue-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-48"
            />
          </div>
        )}
      </div>
      <p className="text-base text-gray-600 mb-3">
        Apply pre-configured capabilities templates to your resource instantly.
      </p>
      {filteredPresets.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No presets match your search.</p>
      ) : (
        <div
          className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${
            filteredPresets.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset)}
            disabled={disabled}
            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm hover:bg-blue-50 disabled:opacity-50 transition-colors text-left"
          >
            <div className="text-base font-medium text-gray-950">{preset.label}</div>
            {preset.description && (
              <div className="text-sm text-gray-600 mt-0.5">{preset.description}</div>
            )}
            <div className="flex gap-2 font-medium text-gray-600 mt-6">
              {[...new Set(preset.capabilities.map((c) => c.method))].map((method) => (
                <div key={method}>{method}</div>
              ))}
            </div>
          </button>
          ))}
        </div>
      )}
    </div>
  );
}
