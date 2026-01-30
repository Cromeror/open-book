'use client';

import { ResourceCapability, HttpMethod } from '@/types/business';
import { Trash2Icon } from 'lucide-react';

export interface CapabilityEditorProps {
  capabilities: ResourceCapability[];
  onChange: (capabilities: ResourceCapability[]) => void;
  resourceCode: string;
  disabled?: boolean;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PATCH', 'DELETE'];

/**
 * CapabilityEditor - Component for editing resource capabilities array
 *
 * Allows adding, editing, and removing capabilities inline.
 * Shows default permission convention {resourceCode}:{capabilityName}
 */
export function CapabilityEditor({
  capabilities,
  onChange,
  resourceCode,
  disabled = false,
}: CapabilityEditorProps) {
  const handleAdd = () => {
    onChange([
      ...capabilities,
      {
        name: '',
        method: 'GET',
        urlPattern: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(capabilities.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ResourceCapability, value: string) => {
    const updated = capabilities.map((cap, i) => {
      if (i === index) {
        return { ...cap, [field]: value };
      }
      return cap;
    });
    onChange(updated);
  };

  const getDefaultPermission = (capabilityName: string) => {
    if (!capabilityName || !resourceCode) return '';
    return `${resourceCode}:${capabilityName}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Capabilities</h3>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Add Capability
        </button>
      </div>

      {capabilities.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
          No capabilities defined. Click "+ Add Capability" to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2"
            >
              <div className="grid grid-cols-12 gap-2">
                {/* Name */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={capability.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    disabled={disabled}
                    placeholder="list"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Method */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={capability.method}
                    onChange={(e) => handleChange(index, 'method', e.target.value)}
                    disabled={disabled}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {HTTP_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL Pattern */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL Pattern
                  </label>
                  <input
                    type="text"
                    value={capability.urlPattern}
                    onChange={(e) => handleChange(index, 'urlPattern', e.target.value)}
                    disabled={disabled}
                    placeholder="/{id}"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Permission */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Permission
                  </label>
                  <input
                    type="text"
                    value={capability.permission || ''}
                    onChange={(e) => handleChange(index, 'permission', e.target.value)}
                    disabled={disabled}
                    placeholder={getDefaultPermission(capability.name)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    title="Remove capability"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Default permission hint */}
              {!capability.permission && capability.name && (
                <p className="text-xs text-gray-500 mt-1">
                  Default permission: <code className="text-blue-600">{getDefaultPermission(capability.name)}</code>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CapabilityEditor;
