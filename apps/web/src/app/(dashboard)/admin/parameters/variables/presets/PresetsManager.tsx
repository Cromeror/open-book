'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCapabilityPresets,
  createCapabilityPreset,
  updateCapabilityPreset,
  deleteCapabilityPreset,
  toggleCapabilityPresetStatus,
  type CapabilityPreset,
} from '@/lib/http-api/capability-presets-api';
import { CapabilityPresetsList, PresetForm, type PresetFormData, type CapabilityPresetAction } from '@/components/organisms/presets';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';

type ViewMode = 'list' | 'create' | 'edit';

/**
 * PresetsManager - Manager component for capability presets
 *
 * Orchestrates the capability presets CRUD operations.
 * Manages view modes (list, create, edit) and handles all API calls.
 */
export function PresetsManager() {
  const router = useRouter();
  const [presets, setPresets] = useState<CapabilityPreset[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPreset, setEditingPreset] = useState<CapabilityPreset | null>(null);
  const [deletePreset, setDeletePreset] = useState<CapabilityPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
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

  const loadPresets = async () => {
    try {
      setLoading(true);
      const data = await getCapabilityPresets(); // Backend returns only active by default
      setPresets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading presets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: PresetFormData) => {
    try {
      setActionLoading(true);
      await createCapabilityPreset(data);
      await loadPresets();
      setSuccessMessage('Preset created successfully');
      setViewMode('list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating preset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: PresetFormData) => {
    if (!editingPreset) return;

    try {
      setActionLoading(true);
      await updateCapabilityPreset(editingPreset.id, {
        label: data.label,
        description: data.description,
        capabilities: data.capabilities,
      });
      await loadPresets();
      setSuccessMessage('Preset updated successfully');
      setViewMode('list');
      setEditingPreset(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating preset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePreset) return;

    try {
      setActionLoading(true);
      await deleteCapabilityPreset(deletePreset.id);
      await loadPresets();
      setSuccessMessage('Preset moved to trash');
      setDeletePreset(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting preset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (preset: CapabilityPreset) => {
    try {
      await toggleCapabilityPresetStatus(preset.id);
      await loadPresets();
      setSuccessMessage(`Preset ${preset.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error toggling preset');
    }
  };

  const handleEdit = (preset: CapabilityPreset) => {
    setEditingPreset(preset);
    setViewMode('edit');
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setEditingPreset(null);
  };

  // Define actions for active presets
  const activePresetActions: CapabilityPresetAction[] = [
    {
      icon: 'Edit',
      label: 'Edit',
      variant: 'primary',
      onClick: handleEdit,
      showCondition: (preset) => !preset.isSystem,
    },
    {
      icon: 'Trash2',
      label: 'Delete',
      variant: 'danger',
      onClick: (preset) => setDeletePreset(preset),
      showCondition: (preset) => !preset.isSystem,
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

      {/* Header - Only show in list mode */}
      {viewMode === 'list' && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Capability Presets</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/admin/parameters/variables/presets/trash')}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              🗑️ View Trash
            </button>
            <button
              type="button"
              onClick={() => setViewMode('create')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              New Preset
            </button>
          </div>
        </div>
      )}

      {/* Form Header - Show in create/edit mode */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {viewMode === 'create' ? 'Create Preset' : 'Edit Preset'}
          </h2>
        </div>
      )}

      {viewMode === 'list' && (
        <CapabilityPresetsList
          presets={presets}
          actions={activePresetActions}
          loading={loading}
        />
      )}

      {viewMode === 'create' && (
        <div className="p-4">
          <PresetForm
            onSubmit={handleCreate}
            onCancel={handleCancelForm}
            loading={actionLoading}
          />
        </div>
      )}

      {viewMode === 'edit' && editingPreset && (
        <div className="p-4">
          <PresetForm
            preset={editingPreset}
            onSubmit={handleUpdate}
            onCancel={handleCancelForm}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletePreset}
        title="Delete Preset"
        message={`Are you sure you want to delete "${deletePreset?.label}"? This will move it to trash and you can restore it later.`}
        variant="danger"
        confirmText="Delete"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletePreset(null)}
      />
    </div>
  );
}
