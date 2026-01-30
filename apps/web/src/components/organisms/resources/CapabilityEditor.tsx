'use client';

import { Button, IconButton } from '@/components/atoms';
import { Section } from '@/components/molecules';
import { ResourceCapability, HttpMethod } from '@/types/business';
import { Puzzle } from 'lucide-react';

export interface CapabilityEditorProps {
  capabilities: ResourceCapability[];
  onChange: (capabilities: ResourceCapability[]) => void;
  baseUrl?: string;
  disabled?: boolean;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PATCH', 'DELETE'];

/**
 * CapabilityEditor - Component for editing resource capabilities array
 *
 * Allows adding, editing, and removing capabilities inline.
 */
export function CapabilityEditor({
  capabilities,
  onChange,
  baseUrl,
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

  const getUrlPreview = (urlPattern: string) => {
    if (!baseUrl) return null;
    return `${baseUrl}${urlPattern}`;
  };

  return (
    <Section title='Capabilities'
      customHeader={
        <div className='flex justify-end w-full'>
          <Button
            icon="Plus"
            onClick={handleAdd}
            disabled={disabled}
          >
            Add Capability
          </Button>
        </div>
      }
      titlePrefix={<div className='flex'>
        <Puzzle className="h-4 w-4 text-blue-500" />
      </div>}
    >
      <div className="space-y-3">
        {capabilities.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            No capabilities defined. Click "+ Add Capability" to add one.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex gap-2 text-sm font-medium text-gray-700">
              <div className="w-40 shrink-0">Name</div>
              <div className="w-28 shrink-0">Method</div>
              <div className="flex-1 min-w-0">URL Pattern</div>
              <div className="shrink-0" style={{ width: 26 }}></div>
            </div>

            {/* Rows */}
            {capabilities.map((capability, index) => (
              <div key={index}>
                <div className="flex gap-2 items-start">
                  {/* Name */}
                  <div className="w-40 shrink-0">
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
                  <div className="w-28 shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={capability.urlPattern}
                      onChange={(e) => handleChange(index, 'urlPattern', e.target.value)}
                      disabled={disabled}
                      placeholder="/{id}"
                      className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {baseUrl && (
                      <p className="mt-1 text-xs text-gray-500 font-mono truncate">
                        {getUrlPreview(capability.urlPattern)}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div className="shrink-0 flex justify-center items-center" style={{ width: 33, height: 33 }}>
                    <IconButton
                      icon="Trash2"
                      variant="secondary"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                      title="Remove capability"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

export default CapabilityEditor;
