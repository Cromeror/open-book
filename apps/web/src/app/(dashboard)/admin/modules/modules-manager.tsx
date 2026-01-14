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
import { ActionConfigDisplay } from '@/components/molecules';

/**
 * Full module entity from API (extends form data with server fields)
 */
interface Module extends ModuleFormData {
  id: string;
  isActive: boolean;
  permissions?: ModulePermission[];
}

/**
 * User with access to a module
 */
interface ModuleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Props {
  initialModules: Module[];
}

export function ModulesManager({ initialModules }: Props) {
  const [modules, setModules] = useState<Module[]>(initialModules || []);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleUsers, setModuleUsers] = useState<ModuleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  const loadModuleUsers = useCallback(async (moduleCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/permissions/users/by-module/${moduleCode}`);
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setModuleUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setModuleUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectModule = (module: Module) => {
    setSelectedModule(module);
    setExpandedActions(new Set());
    setEditMode(false);
    setError(null);
    loadModuleUsers(module.code);
  };

  const handleToggleStatus = async () => {
    if (!selectedModule) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modules/${selectedModule.id}/toggle`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al cambiar estado');
      }

      const updatedModule = await response.json();

      setModules((prev) =>
        prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
      );
      setSelectedModule(updatedModule);
      setSuccessMessage(
        `Modulo ${updatedModule.isActive ? 'activado' : 'desactivado'} correctamente`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedModule) return;
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setCreateMode(false);
  };

  const handleStartCreate = () => {
    setSelectedModule(null);
    setEditMode(false);
    setCreateMode(true);
    setError(null);
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

      const newModule = await response.json();

      setModules((prev) => [...prev, newModule]);
      setSelectedModule(newModule);
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

      const updatedModule = await response.json();

      setModules((prev) =>
        prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
      );
      setSelectedModule(updatedModule);
      setEditMode(false);
      setSuccessMessage('Modulo actualizado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const toggleActionExpand = (actionCode: string) => {
    setExpandedActions((prev) => {
      const next = new Set(prev);
      if (next.has(actionCode)) {
        next.delete(actionCode);
      } else {
        next.add(actionCode);
      }
      return next;
    });
  };

  const getTypeLabel = (type: string) => {
    return type === 'crud' ? 'CRUD' : 'Especializado';
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'crud' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // Handler for ModuleList selection
  const handleModuleListSelect = (module: ModuleListItem) => {
    const fullModule = modules.find((m) => m.id === module.id);
    if (fullModule) {
      handleSelectModule(fullModule);
    }
  };

  // Convert selected module to form data
  const getEditFormData = (): ModuleFormData | null => {
    if (!selectedModule) return null;
    return {
      code: selectedModule.code,
      name: selectedModule.name,
      description: selectedModule.description,
      icon: selectedModule.icon,
      type: selectedModule.type,
      entity: selectedModule.entity,
      endpoint: selectedModule.endpoint,
      component: selectedModule.component,
      navConfig: selectedModule.navConfig,
      actionsConfig: selectedModule.actionsConfig,
      order: selectedModule.order,
      tags: selectedModule.tags,
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Modules List */}
      <div className="lg:col-span-1">
        <ModuleList
          modules={modules}
          selectedModuleId={selectedModule?.id}
          onSelectModule={handleModuleListSelect}
          onCreateModule={handleStartCreate}
          loading={loading}
        />
      </div>

      {/* Module Detail Panel */}
      <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {createMode
                ? 'Registrar Modulo'
                : selectedModule
                  ? selectedModule.name
                  : 'Selecciona un modulo'}
            </h2>
            {selectedModule && !editMode && !createMode && (
              <p className="text-xs text-gray-500 mt-1">{selectedModule.description}</p>
            )}
          </div>
          {selectedModule && !editMode && !createMode && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStartEdit}
                disabled={loading}
                className="rounded px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={loading}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  selectedModule.isActive
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {selectedModule.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {successMessage && (
          <div className="m-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {createMode ? (
          <ModuleCreateForm
            onSubmit={handleCreateSubmit}
            onCancel={handleCancelEdit}
            loading={loading}
            initialOrder={modules.length}
          />
        ) : !selectedModule ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Selecciona un modulo para ver sus detalles y configuracion
          </div>
        ) : editMode ? (
          <ModuleEditForm
            onSubmit={handleEditSubmit}
            onCancel={handleCancelEdit}
            loading={loading}
            initialData={getEditFormData()!}
            permissions={selectedModule.permissions}
          />
        ) : (
          <div className="p-4 space-y-6 max-h-[550px] overflow-y-auto">
            {/* Module Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">Tipo</p>
                <p className="mt-1 text-sm text-gray-900">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${getTypeBadgeColor(selectedModule.type)}`}
                  >
                    {getTypeLabel(selectedModule.type)}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">Estado</p>
                <p className="mt-1 text-sm">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      selectedModule.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedModule.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
              {selectedModule.type === 'crud' && (
                <>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Entidad</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <code className="bg-gray-100 px-1 rounded">
                        {selectedModule.entity || '-'}
                      </code>
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Endpoint</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <code className="bg-gray-100 px-1 rounded">
                        {selectedModule.endpoint || '-'}
                      </code>
                    </p>
                  </div>
                </>
              )}
              {selectedModule.type === 'specialized' && (
                <div className="rounded-lg border border-gray-200 p-3 col-span-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">Componente</p>
                  <p className="mt-1 text-sm text-gray-900">
                    <code className="bg-gray-100 px-1 rounded">
                      {selectedModule.component || '-'}
                    </code>
                  </p>
                </div>
              )}
              {selectedModule.navConfig && (
                <>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Ruta Nav</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <code className="bg-gray-100 px-1 rounded">
                        {selectedModule.navConfig.path}
                      </code>
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Orden Nav</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedModule.navConfig.order}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Permissions Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Permisos del Modulo</h3>
              {selectedModule.permissions && selectedModule.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedModule.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="rounded border border-gray-200 bg-gray-50 px-3 py-1.5"
                      title={perm.description || perm.name}
                    >
                      <code className="text-xs text-gray-700">{perm.code}</code>
                      <span className="ml-2 text-xs text-gray-500">{perm.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Sin permisos definidos</p>
              )}
            </div>

            {/* Actions Configuration */}
            {selectedModule.actionsConfig && selectedModule.actionsConfig.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Configuracion de Acciones
                </h3>
                <div className="space-y-2">
                  {selectedModule.actionsConfig.map((action) => (
                    <div
                      key={action.code}
                      className="rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleActionExpand(action.code)}
                        className="w-full px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {action.code}
                          </code>
                          <span className="text-sm text-gray-700">{action.label}</span>
                          {action.settings?.type && (
                            <span className="text-xs text-gray-400">
                              ({action.settings.type})
                            </span>
                          )}
                        </div>
                        <svg
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            expandedActions.has(action.code) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {expandedActions.has(action.code) && action.settings && (
                        <div className="px-3 py-2 border-t border-gray-200 bg-white">
                          {action.description && (
                            <p className="text-xs text-gray-500 mb-2">{action.description}</p>
                          )}
                          <ActionConfigDisplay settings={action.settings} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users with Access */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Usuarios con Acceso
                {moduleUsers.length > 0 && (
                  <span className="ml-2 text-gray-500 font-normal">({moduleUsers.length})</span>
                )}
              </h3>
              {loading ? (
                <p className="text-xs text-gray-500">Cargando usuarios...</p>
              ) : moduleUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {moduleUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Ningun usuario tiene acceso directo a este modulo
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
