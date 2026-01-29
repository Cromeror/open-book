'use client';

import { useState } from 'react';
import type { CapabilityPreset } from '@/lib/http-api/capability-presets-api';

export interface PresetFormData {
  id: string;
  label: string;
  description?: string;
  capabilities: Array<{
    method: string;
    name: string;
    urlPattern: string;
  }>;
}

export interface PresetFormProps {
  preset?: CapabilityPreset;
  onSubmit: (data: PresetFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * PresetForm - Organism component for creating/editing capability presets
 *
 * Provides a form with id, label, description fields and a dynamic
 * capabilities editor (add/remove capabilities with method, name, urlPattern).
 */
export function PresetForm({ preset, onSubmit, onCancel, loading = false }: PresetFormProps) {
  const [id, setId] = useState(preset?.id || '');
  const [label, setLabel] = useState(preset?.label || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [capabilities, setCapabilities] = useState<Array<{ method: string; name: string; urlPattern: string }>>(
    preset?.capabilities.length
      ? preset.capabilities.map((cap) => ({
          method: cap.method || 'GET',
          name: cap.name || '',
          urlPattern: cap.urlPattern || '',
        }))
      : [{ method: 'GET', name: '', urlPattern: '' }]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id,
      label,
      description,
      capabilities,
    });
  };

  const addCapability = () => {
    setCapabilities([...capabilities, { method: 'GET', name: '', urlPattern: '' }]);
  };

  const removeCapability = (index: number) => {
    setCapabilities(capabilities.filter((_, i) => i !== index));
  };

  const updateCapability = (index: number, field: 'method' | 'name' | 'urlPattern', value: string) => {
    setCapabilities((prev) =>
      prev.map((cap, i) =>
        i === index ? { method: cap.method, name: cap.name, urlPattern: cap.urlPattern, [field]: value } : cap
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      {/* ID Field (disabled on edit) */}
      {!preset && (
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
            ID *
          </label>
          <input
            id="id"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="crud"
          />
          <p className="text-xs text-gray-500 mt-1">
            Unique identifier (lowercase, no spaces)
          </p>
        </div>
      )}

      {/* Label Field */}
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
          Label *
        </label>
        <input
          id="label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          disabled={loading}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Full CRUD"
        />
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={3}
          placeholder="Description of this preset"
        />
      </div>

      {/* Capabilities Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Capabilities *
          </label>
          <button
            type="button"
            onClick={addCapability}
            disabled={loading}
            className="text-sm px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Capability
          </button>
        </div>

        {capabilities.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">No capabilities yet. Add at least one.</p>
        )}

        <div className="space-y-3">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className="flex gap-2 items-start bg-gray-50 p-3 rounded-md border border-gray-200"
            >
              {/* Method Select */}
              <div className="w-24">
                <label htmlFor={`method-${idx}`} className="block text-xs text-gray-600 mb-1">
                  Method
                </label>
                <select
                  id={`method-${idx}`}
                  value={cap.method}
                  onChange={(e) => updateCapability(idx, 'method', e.target.value)}
                  disabled={loading}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              {/* Name Input */}
              <div className="flex-1">
                <label htmlFor={`name-${idx}`} className="block text-xs text-gray-600 mb-1">
                  Name
                </label>
                <input
                  id={`name-${idx}`}
                  type="text"
                  value={cap.name}
                  onChange={(e) => updateCapability(idx, 'name', e.target.value)}
                  disabled={loading}
                  placeholder="list"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* URL Pattern Input */}
              <div className="flex-1">
                <label htmlFor={`urlPattern-${idx}`} className="block text-xs text-gray-600 mb-1">
                  URL Pattern
                </label>
                <input
                  id={`urlPattern-${idx}`}
                  type="text"
                  value={cap.urlPattern}
                  onChange={(e) => updateCapability(idx, 'urlPattern', e.target.value)}
                  disabled={loading}
                  placeholder="/"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Remove Button */}
              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => removeCapability(idx)}
                  disabled={loading || capabilities.length === 1}
                  className="px-2 py-1.5 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove capability"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Define the HTTP capabilities this preset provides
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !id || !label || capabilities.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : preset ? 'Update Preset' : 'Create Preset'}
        </button>
      </div>
    </form>
  );
}
