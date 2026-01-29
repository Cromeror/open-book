'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  toggleCapabilityPresetStatus,
  type CapabilityPreset,
} from '@/lib/http-api/capability-presets-api';
import { CapabilityPresetsList, type CapabilityPresetAction } from '@/components/organisms/presets';

/**
 * PresetsTrashManager - Manager component for trashed capability presets
 *
 * Displays inactive presets and allows restoring them.
 */
export function PresetsTrashManager() {
  const router = useRouter();
  const [presets, setPresets] = useState<CapabilityPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load inactive presets on mount
  useEffect(() => {
    loadInactivePresets();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage, error]);

  const loadInactivePresets = async () => {
    try {
      setLoading(true);
      // Fetch only inactive presets via backend filter
      const response = await fetch('/api/admin/capability-presets?inactive=true', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load trash');
      }

      const data: CapabilityPreset[] = await response.json();
      setPresets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading trash');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (preset: CapabilityPreset) => {
    try {
      await toggleCapabilityPresetStatus(preset.id);
      await loadInactivePresets();
      setSuccessMessage(`Preset "${preset.label}" restored successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error restoring preset');
    }
  };

  const trashPresetActions: CapabilityPresetAction[] = [
    {
      icon: 'RotateCcw',
      label: 'Restore',
      variant: 'success',
      onClick: handleRestore,
      title: 'Restore preset',
    },
  ];

  return (
    <div>
      {/* Messages */}
      {successMessage && (
        <div className="m-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          Capability Presets Trash
        </h2>
      </div>

      {/* Presets List */}
      <CapabilityPresetsList
        presets={presets}
        actions={trashPresetActions}
        loading={loading}
        emptyMessage="Trash is empty"
        emptyIcon="Trash2"
      />
    </div>
  );
}
