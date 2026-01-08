'use client';

import { useState, useCallback } from 'react';
import type {
  ModuleWithActions,
  ModuleAction,
  ReadActionSettings,
  CreateActionSettings,
  UpdateActionSettings,
  DeleteActionSettings,
} from '@/lib/types/modules';
import { GenericList } from './GenericList';
import { GenericForm } from './GenericForm';
import { GenericDetail } from './GenericDetail';
import { ModuleHeader } from './ModuleHeader';
import { Icon } from '@/components/layout/Icon';

type View = 'list' | 'create' | 'detail' | 'edit';

export interface ModuleProps {
  moduleCode: string;
  metadata: ModuleWithActions;
}

/**
 * Helper to get an action by code with typed settings
 */
function getAction<T>(
  actions: ModuleAction[],
  code: string
): (ModuleAction & { settings: T }) | undefined {
  return actions.find((a) => a.code === code) as
    | (ModuleAction & { settings: T })
    | undefined;
}

/**
 * Generic CRUD module component that renders operations based on user's allowed actions
 *
 * Key principle: action code = permission code
 * If an action exists in the actions array, the user has permission for it
 */
export function GenericCRUDModule({ metadata }: ModuleProps) {
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get actions by code - if it exists, user has permission (action code = permission code)
  const readAction = getAction<ReadActionSettings>(metadata.actions, 'read');
  const createAction = getAction<CreateActionSettings>(metadata.actions, 'create');
  const updateAction = getAction<UpdateActionSettings>(metadata.actions, 'update');
  const deleteAction = getAction<DeleteActionSettings>(metadata.actions, 'delete');

  // User must have read permission to see anything
  if (!readAction) {
    return (
      <div className="p-8 text-center">
        <Icon name="Lock" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Acceso Restringido
        </h2>
        <p className="text-gray-500">
          No tiene permisos para ver este modulo.
        </p>
      </div>
    );
  }

  const handleView = useCallback((id: string) => {
    setSelectedId(id);
    setView('detail');
  }, []);

  const handleEdit = useCallback((id: string) => {
    setSelectedId(id);
    setView('edit');
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!deleteAction || !metadata.endpoint) return;

      const confirmed = window.confirm(deleteAction.settings.confirmation);
      if (!confirmed) return;

      try {
        const response = await fetch(`${metadata.endpoint}/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar');
        }

        // Refresh the list
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Error al eliminar. Por favor intente de nuevo.');
      }
    },
    [deleteAction, metadata.endpoint]
  );

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setView('list');
  }, []);

  const handleSuccess = useCallback(() => {
    setSelectedId(null);
    setView('list');
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={metadata.label}
        description={metadata.description}
        icon={metadata.icon}
        onBack={view !== 'list' ? handleBack : undefined}
      />

      {view === 'list' && (
        <>
          {createAction && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setView('create')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Icon name="Plus" className="w-4 h-4" />
                Crear {metadata.entity}
              </button>
            </div>
          )}
          <GenericList
            key={refreshKey}
            config={readAction.settings}
            endpoint={metadata.endpoint!}
            entity={metadata.entity!}
            onView={handleView}
            onEdit={updateAction ? handleEdit : undefined}
            onDelete={deleteAction ? handleDelete : undefined}
          />
        </>
      )}

      {view === 'create' && createAction && (
        <GenericForm
          config={createAction.settings}
          endpoint={metadata.endpoint!}
          entity={metadata.entity!}
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}

      {view === 'detail' && selectedId && (
        <GenericDetail
          config={readAction.settings}
          endpoint={metadata.endpoint!}
          entity={metadata.entity!}
          id={selectedId}
          onEdit={updateAction ? () => setView('edit') : undefined}
          onBack={handleBack}
        />
      )}

      {view === 'edit' && selectedId && updateAction && (
        <GenericForm
          config={updateAction.settings}
          endpoint={`${metadata.endpoint}/${selectedId}`}
          entity={metadata.entity!}
          mode="edit"
          id={selectedId}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}
