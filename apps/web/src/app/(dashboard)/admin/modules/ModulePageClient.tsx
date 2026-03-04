'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ModuleList,
  ModuleCreateForm,
  ModuleEditForm,
  type ModuleListItem,
  type ModuleFormData,
  type ModulePermission,
} from '@/components/organisms';

/**
 * Full module entity from API
 */
interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  entity?: string;
  endpoint?: string;
  component?: string;
  navConfig?: { path: string; order: number };
  actionsConfig?: unknown[];
  order: number;
  tags?: string[];
  isActive: boolean;
  permissions?: ModulePermission[];
}

interface Props {
  initialModules: Module[];
}

export function ModulePageClient({ initialModules }: Props) {
  const [modules, setModules] = useState<Module[]>(initialModules || []);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  const handleSelectModule = useCallback((item: ModuleListItem) => {
    const full = modules.find((m) => m.id === item.id) ?? null;
    setSelectedModule(full);
    setEditMode(false);
    setCreateMode(false);
    setError(null);
  }, [modules]);

  const handleEditModule = useCallback((item: ModuleListItem) => {
    const full = modules.find((m) => m.id === item.id) ?? null;
    setSelectedModule(full);
    setCreateMode(false);
    setEditMode(true);
    setError(null);
  }, [modules]);

  const handleToggleStatus = useCallback(async (item: ModuleListItem) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modules/${item.id}/toggle`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al cambiar estado');
      }

      const updated: Module = await response.json();
      setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSuccessMessage(`Modulo ${updated.isActive ? 'activado' : 'desactivado'} correctamente`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartCreate = () => {
    setSelectedModule(null);
    setEditMode(false);
    setCreateMode(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setCreateMode(false);
  };

  const handleCreateSubmit = async (formData: ModuleFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.errors?.join(', ') || 'Error al crear modulo');
      }

      const newModule: Module = await response.json();
      setModules((prev) => [...prev, newModule]);
      setCreateMode(false);
      setSuccessMessage('Modulo creado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (formData: ModuleFormData) => {
    if (!selectedModule) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modules/${selectedModule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.errors?.join(', ') || 'Error al guardar');
      }

      const updated: Module = await response.json();
      setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedModule(updated);
      setEditMode(false);
      setSuccessMessage('Modulo actualizado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getEditFormData = (): ModuleFormData | null => {
    if (!selectedModule) return null;
    return {
      code: selectedModule.code,
      name: selectedModule.name,
      description: selectedModule.description,
      icon: selectedModule.icon,
      entity: selectedModule.entity,
      endpoint: selectedModule.endpoint,
      component: selectedModule.component,
      navConfig: selectedModule.navConfig,
      actionsConfig: selectedModule.actionsConfig as ModuleFormData['actionsConfig'],
      order: selectedModule.order,
      tags: selectedModule.tags,
    };
  };

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  if (createMode) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <ModuleCreateForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancel}
          loading={loading}
          initialOrder={modules.length}
        />
      </div>
    );
  }

  if (editMode && selectedModule) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <ModuleEditForm
          onSubmit={handleEditSubmit}
          onCancel={handleCancel}
          loading={loading}
          initialData={getEditFormData()!}
          permissions={selectedModule.permissions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          {successMessage}
        </div>
      )}

      <ModuleList
        modules={modules}
        selectedModuleId={selectedModule?.id}
        onSelectModule={handleSelectModule}
        onEditModule={handleEditModule}
        onToggleStatus={handleToggleStatus}
        onCreateModule={handleStartCreate}
        loading={loading}
      />
    </div>
  );
}
