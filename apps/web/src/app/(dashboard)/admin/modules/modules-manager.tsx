'use client';

import { useState, useCallback, useEffect } from 'react';

interface ModulePermission {
  id: string;
  code: string;
  name: string;
  description?: string;
}

interface NavConfig {
  path: string;
  order: number;
}

interface ActionSettings {
  type: string;
  listColumns?: Array<{ field: string; label: string; sortable?: boolean; format?: string }>;
  filters?: Array<{ field: string; type: string; label: string; options?: Array<{ value: string; label: string }> }>;
  defaultSort?: { field: string; order: string };
  fields?: Array<{ name: string; label: string; type: string; required?: boolean; options?: Array<{ value: string; label: string }>; min?: number; max?: number }>;
  confirmation?: string;
  soft?: boolean;
}

interface ModuleAction {
  code: string;
  label: string;
  description?: string;
  settings?: ActionSettings;
}

interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  type: 'crud' | 'specialized';
  entity?: string;
  endpoint?: string;
  component?: string;
  navConfig?: NavConfig;
  actionsConfig?: ModuleAction[];
  order: number;
  isActive: boolean;
  permissions?: ModulePermission[];
}

interface ModuleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Props {
  initialModules: Module[];
}

const ICON_MAP: Record<string, string> = {
  Target: '🎯',
  Users: '👥',
  Building: '🏢',
  Home: '🏠',
  Calendar: '📅',
  HandHeart: '🤝',
  DollarSign: '💰',
  MessageSquare: '💬',
  BarChart: '📊',
  History: '📜',
  Bell: '🔔',
  Settings: '⚙️',
};

const AVAILABLE_ICONS = [
  'Target', 'Users', 'Building', 'Home', 'Calendar', 'HandHeart',
  'DollarSign', 'MessageSquare', 'BarChart', 'History', 'Bell', 'Settings'
];

export function ModulesManager({ initialModules }: Props) {
  const [modules, setModules] = useState<Module[]>(initialModules || []);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleUsers, setModuleUsers] = useState<ModuleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Module>>({});

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

      // Update modules list
      setModules((prev) =>
        prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
      );
      setSelectedModule(updatedModule);
      setSuccessMessage(`Modulo ${updatedModule.isActive ? 'activado' : 'desactivado'} correctamente`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedModule) return;
    setEditForm({
      name: selectedModule.name,
      description: selectedModule.description || '',
      icon: selectedModule.icon || '',
      type: selectedModule.type,
      entity: selectedModule.entity || '',
      endpoint: selectedModule.endpoint || '',
      component: selectedModule.component || '',
      order: selectedModule.order,
      navConfig: selectedModule.navConfig,
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!selectedModule) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modules/${selectedModule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.errors?.join(', ') || 'Error al guardar');
      }

      const updatedModule = await response.json();

      // Update modules list
      setModules((prev) =>
        prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
      );
      setSelectedModule(updatedModule);
      setEditMode(false);
      setEditForm({});
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
    return type === 'crud'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  };

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Modules List */}
      <div className="lg:col-span-1 rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Modulos</h2>
          <p className="text-xs text-gray-500 mt-1">{modules.length} modulos registrados</p>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {modules.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No hay modulos registrados
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {modules.map((module) => (
                <li key={module.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectModule(module)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                      selectedModule?.id === module.id ? 'bg-blue-50' : ''
                    } ${!module.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl" title={module.icon || 'Module'}>
                          {ICON_MAP[module.icon || ''] || '📦'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {module.name}
                            </p>
                            {!module.isActive && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                                Inactivo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            <code>{module.code}</code>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${getTypeBadgeColor(module.type)}`}
                      >
                        {getTypeLabel(module.type)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Module Detail Panel */}
      <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedModule ? selectedModule.name : 'Selecciona un modulo'}
            </h2>
            {selectedModule && !editMode && (
              <p className="text-xs text-gray-500 mt-1">{selectedModule.description}</p>
            )}
          </div>
          {selectedModule && !editMode && (
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
          <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="m-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {!selectedModule ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Selecciona un modulo para ver sus detalles y configuracion
          </div>
        ) : editMode ? (
          <ModuleEditForm
            editForm={editForm}
            setEditForm={setEditForm}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            loading={loading}
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
                      <code className="bg-gray-100 px-1 rounded">{selectedModule.entity || '-'}</code>
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Endpoint</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <code className="bg-gray-100 px-1 rounded">{selectedModule.endpoint || '-'}</code>
                    </p>
                  </div>
                </>
              )}
              {selectedModule.type === 'specialized' && (
                <div className="rounded-lg border border-gray-200 p-3 col-span-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">Componente</p>
                  <p className="mt-1 text-sm text-gray-900">
                    <code className="bg-gray-100 px-1 rounded">{selectedModule.component || '-'}</code>
                  </p>
                </div>
              )}
              {selectedModule.navConfig && (
                <>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Ruta Nav</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <code className="bg-gray-100 px-1 rounded">{selectedModule.navConfig.path}</code>
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Orden Nav</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedModule.navConfig.order}</p>
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
                <h3 className="text-sm font-medium text-gray-900 mb-3">Configuracion de Acciones</h3>
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
                            <span className="text-xs text-gray-400">({action.settings.type})</span>
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
                          <ActionSettingsDisplay settings={action.settings} />
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

// Edit Form Component
interface ModuleEditFormProps {
  editForm: Partial<Module>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Module>>>;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ModuleEditForm({ editForm, setEditForm, onSave, onCancel, loading }: ModuleEditFormProps) {
  const inputClasses = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100";
  const labelClasses = "block text-xs font-medium text-gray-700";

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className={labelClasses}>Nombre</label>
          <input
            type="text"
            value={editForm.name || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            className={inputClasses}
            disabled={loading}
          />
        </div>

        {/* Icon */}
        <div>
          <label className={labelClasses}>Icono</label>
          <select
            value={editForm.icon || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, icon: e.target.value }))}
            className={inputClasses}
            disabled={loading}
          >
            <option value="">Seleccionar icono</option>
            {AVAILABLE_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {ICON_MAP[icon]} {icon}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className={labelClasses}>Descripcion</label>
          <textarea
            value={editForm.description || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
            className={inputClasses}
            rows={2}
            disabled={loading}
          />
        </div>

        {/* Type */}
        <div>
          <label className={labelClasses}>Tipo</label>
          <select
            value={editForm.type || 'crud'}
            onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value as 'crud' | 'specialized' }))}
            className={inputClasses}
            disabled={loading}
          >
            <option value="crud">CRUD</option>
            <option value="specialized">Especializado</option>
          </select>
        </div>

        {/* Order */}
        <div>
          <label className={labelClasses}>Orden</label>
          <input
            type="number"
            value={editForm.order ?? 0}
            onChange={(e) => setEditForm((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))}
            className={inputClasses}
            min={0}
            disabled={loading}
          />
        </div>

        {/* Entity (for CRUD) */}
        {editForm.type === 'crud' && (
          <>
            <div>
              <label className={labelClasses}>Entidad</label>
              <input
                type="text"
                value={editForm.entity || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, entity: e.target.value }))}
                className={inputClasses}
                placeholder="Ej: Objetivo"
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClasses}>Endpoint</label>
              <input
                type="text"
                value={editForm.endpoint || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, endpoint: e.target.value }))}
                className={inputClasses}
                placeholder="Ej: /api/goals"
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* Component (for specialized) */}
        {editForm.type === 'specialized' && (
          <div className="col-span-2">
            <label className={labelClasses}>Componente</label>
            <input
              type="text"
              value={editForm.component || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, component: e.target.value }))}
              className={inputClasses}
              placeholder="Ej: ReportsModule"
              disabled={loading}
            />
          </div>
        )}

        {/* Nav Config */}
        <div>
          <label className={labelClasses}>Ruta de Navegacion</label>
          <input
            type="text"
            value={editForm.navConfig?.path || ''}
            onChange={(e) => setEditForm((prev) => ({
              ...prev,
              navConfig: { ...prev.navConfig, path: e.target.value, order: prev.navConfig?.order ?? 0 }
            }))}
            className={inputClasses}
            placeholder="Ej: /goals"
            disabled={loading}
          />
        </div>
        <div>
          <label className={labelClasses}>Orden de Navegacion</label>
          <input
            type="number"
            value={editForm.navConfig?.order ?? 0}
            onChange={(e) => setEditForm((prev) => ({
              ...prev,
              navConfig: { ...prev.navConfig, path: prev.navConfig?.path ?? '', order: parseInt(e.target.value, 10) || 0 }
            }))}
            className={inputClasses}
            min={0}
            disabled={loading}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Component to display action settings details
function ActionSettingsDisplay({ settings }: { settings: ActionSettings }) {
  return (
    <div className="space-y-3 text-xs">
      {/* List Columns for read actions */}
      {settings.listColumns && settings.listColumns.length > 0 && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Columnas de Lista:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-gray-600">Campo</th>
                  <th className="px-2 py-1 text-left text-gray-600">Etiqueta</th>
                  <th className="px-2 py-1 text-left text-gray-600">Ordenable</th>
                  <th className="px-2 py-1 text-left text-gray-600">Formato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.listColumns.map((col, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">
                      <code className="text-blue-600">{col.field}</code>
                    </td>
                    <td className="px-2 py-1 text-gray-600">{col.label}</td>
                    <td className="px-2 py-1">
                      {col.sortable ? (
                        <span className="text-green-600">Si</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-gray-500">{col.format || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Default Sort */}
      {settings.defaultSort && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Orden por Defecto:</p>
          <code className="bg-gray-100 px-2 py-0.5 rounded">
            {settings.defaultSort.field} ({settings.defaultSort.order})
          </code>
        </div>
      )}

      {/* Filters */}
      {settings.filters && settings.filters.length > 0 && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Filtros:</p>
          <div className="flex flex-wrap gap-1">
            {settings.filters.map((filter, i) => (
              <span
                key={i}
                className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded"
                title={`Tipo: ${filter.type}`}
              >
                {filter.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      {settings.fields && settings.fields.length > 0 && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Campos del Formulario:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-gray-600">Nombre</th>
                  <th className="px-2 py-1 text-left text-gray-600">Etiqueta</th>
                  <th className="px-2 py-1 text-left text-gray-600">Tipo</th>
                  <th className="px-2 py-1 text-left text-gray-600">Requerido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.fields.map((field, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">
                      <code className="text-blue-600">{field.name}</code>
                    </td>
                    <td className="px-2 py-1 text-gray-600">{field.label}</td>
                    <td className="px-2 py-1 text-gray-500">{field.type}</td>
                    <td className="px-2 py-1">
                      {field.required ? (
                        <span className="text-red-600">Si</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {settings.confirmation && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Mensaje de Confirmacion:</p>
          <p className="text-gray-600 italic">&quot;{settings.confirmation}&quot;</p>
          {settings.soft !== undefined && (
            <p className="text-gray-500 mt-1">
              Borrado: {settings.soft ? 'Logico (soft delete)' : 'Permanente'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
