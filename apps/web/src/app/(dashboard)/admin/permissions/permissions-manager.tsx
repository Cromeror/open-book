'use client';

import { useState, useCallback, useEffect } from 'react';

interface ModulePermission {
  id: string;
  code: string;
  name: string;
  description?: string;
}

interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions?: ModulePermission[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  publicAccountConsent: boolean;
  consentDate?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPermissionsData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  modules: Array<{
    module: Module;
    source: 'direct' | 'pool';
    poolName?: string;
  }>;
  permissions: Array<{
    id?: string;
    permission: {
      id: string;
      code: string;
      name: string;
      module: Module;
    };
    scope: string;
    scopeId?: string;
    source: 'direct' | 'pool';
    poolName?: string;
  }>;
}

interface Props {
  initialModules: Module[];
  initialUsers: User[];
}

export function PermissionsManager({ initialModules, initialUsers }: Props) {
  const [users] = useState<User[]>(initialUsers || []);
  const [modules] = useState<Module[]>(initialModules || []);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);

  const filteredUsers = (users || []).filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadUserPermissions = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/permissions/users/${userId}/permissions`);
      if (!response.ok) throw new Error('Error al cargar permisos');
      const data = await response.json();
      setUserPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setUserPermissions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSuccessMessage(null);
    setShowAddModule(false);
    loadUserPermissions(user.id);
  };

  // Grant module only (no permissions)
  const handleGrantModule = async (moduleId: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/permissions/users/${selectedUser.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al asignar modulo');
      }

      setSuccessMessage('Modulo asignado correctamente');
      setShowAddModule(false);
      await loadUserPermissions(selectedUser.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeModule = async (moduleId: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/permissions/users/${selectedUser.id}/modules/${moduleId}`,
        { method: 'DELETE' }
      );

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.message || 'Error al revocar modulo');
      }

      setSuccessMessage('Modulo revocado correctamente');
      await loadUserPermissions(selectedUser.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async (modulePermissionId: string, scope: 'own' | 'copropiedad' | 'all', scopeId?: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const body: { modulePermissionId: string; scope: string; scopeId?: string } = {
        modulePermissionId,
        scope,
      };
      if (scope === 'copropiedad' && scopeId) {
        body.scopeId = scopeId;
      }

      const response = await fetch(`/api/admin/permissions/users/${selectedUser.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al asignar permiso');
      }

      setSuccessMessage('Permiso asignado correctamente');
      await loadUserPermissions(selectedUser.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePermission = async (userPermissionId: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/permissions/users/${selectedUser.id}/permissions/${userPermissionId}`,
        { method: 'DELETE' }
      );

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.message || 'Error al revocar permiso');
      }

      setSuccessMessage('Permiso revocado correctamente');
      await loadUserPermissions(selectedUser.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Get assigned module IDs (direct only)
  const assignedModuleIds = new Set(
    userPermissions?.modules
      .filter(m => m.source === 'direct')
      .map(m => m.module.id) || []
  );

  // Get available modules (not yet assigned)
  const availableModules = modules.filter(m => !assignedModuleIds.has(m.id));

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Users List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Usuarios</h2>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron usuarios
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                      selectedUser?.id === user.id ? 'bg-blue-50' : ''
                    } ${!user.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          {!user.isActive && (
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {user.isSuperAdmin && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                            SuperAdmin
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* User Permissions Panel */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedUser
              ? `Permisos de ${selectedUser.firstName} ${selectedUser.lastName}`
              : 'Selecciona un usuario'}
          </h2>
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

        {!selectedUser ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Selecciona un usuario para ver y gestionar sus permisos
          </div>
        ) : selectedUser.isSuperAdmin ? (
          <div className="p-8 text-center">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
              SuperAdmin
            </span>
            <p className="mt-2 text-sm text-gray-500">
              Este usuario tiene acceso total al sistema
            </p>
          </div>
        ) : loading && !userPermissions ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Cargando permisos...
          </div>
        ) : (
          <div className="p-4 space-y-6 max-h-[550px] overflow-y-auto">
            {/* Assigned Modules Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Modulos Asignados</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModule(!showAddModule)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showAddModule ? 'Cancelar' : '+ Agregar modulo'}
                </button>
              </div>

              {/* Add Module Dropdown */}
              {showAddModule && (
                <div className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50">
                  <p className="text-xs text-blue-700 mb-2">Selecciona un modulo para asignar:</p>
                  {availableModules.length === 0 ? (
                    <p className="text-xs text-gray-500">Todos los modulos ya estan asignados</p>
                  ) : (
                    <div className="space-y-1">
                      {availableModules.map((module) => (
                        <button
                          key={module.id}
                          type="button"
                          onClick={() => handleGrantModule(module.id)}
                          disabled={loading}
                          className="w-full text-left p-2 rounded border border-blue-300 bg-white text-sm hover:bg-blue-100 disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{module.name}</span>
                            <code className="text-xs text-gray-400">{module.code}</code>
                          </div>
                          {module.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Modules List */}
              {userPermissions?.modules && userPermissions.modules.length > 0 ? (
                <div className="space-y-3">
                  {userPermissions.modules.map((item, index) => (
                    <AssignedModuleCard
                      key={`${item.module.id}-${index}`}
                      moduleItem={item}
                      moduleDefinition={modules.find(m => m.id === item.module.id)}
                      userPermissions={userPermissions.permissions.filter(
                        p => p.permission.module.id === item.module.id
                      )}
                      onRevokeModule={() => handleRevokeModule(item.module.id)}
                      onGrantPermission={handleGrantPermission}
                      onRevokePermission={handleRevokePermission}
                      loading={loading}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500">No tiene modulos asignados</p>
                  <button
                    type="button"
                    onClick={() => setShowAddModule(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Asignar primer modulo
                  </button>
                </div>
              )}
            </div>

            {/* Pool Memberships Info */}
            {userPermissions?.modules.some(m => m.source === 'pool') && (
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                Los modulos marcados como &quot;via Pool&quot; son heredados y no pueden ser removidos directamente.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Scope options
type PermissionScope = 'own' | 'copropiedad' | 'all';

const SCOPE_OPTIONS: { value: PermissionScope; label: string; description: string }[] = [
  { value: 'own', label: 'Propio', description: 'Solo puede operar sobre sus propios registros' },
  { value: 'copropiedad', label: 'Copropiedad', description: 'Puede operar sobre registros de una copropiedad específica' },
  { value: 'all', label: 'Todos', description: 'Puede operar sobre todos los registros del sistema' },
];

// Component for displaying an assigned module with its permissions
interface AssignedModuleCardProps {
  moduleItem: {
    module: Module;
    source: 'direct' | 'pool';
    poolName?: string;
  };
  moduleDefinition?: Module;
  userPermissions: Array<{
    id?: string;
    permission: {
      id: string;
      code: string;
      name: string;
      module: Module;
    };
    scope: string;
    scopeId?: string;
    source: 'direct' | 'pool';
    poolName?: string;
  }>;
  onRevokeModule: () => void;
  onGrantPermission: (modulePermissionId: string, scope: PermissionScope, scopeId?: string) => void;
  onRevokePermission: (userPermissionId: string) => void;
  loading: boolean;
}

function AssignedModuleCard({
  moduleItem,
  moduleDefinition,
  userPermissions,
  onRevokeModule,
  onGrantPermission,
  onRevokePermission,
  loading,
}: AssignedModuleCardProps) {
  const [showAddPermission, setShowAddPermission] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<ModulePermission | null>(null);
  const [selectedScope, setSelectedScope] = useState<PermissionScope>('own');
  const [scopeId, setScopeId] = useState('');
  const canEdit = moduleItem.source === 'direct';

  // Get user's permission IDs for this module
  const userPermissionIds = new Set(
    userPermissions
      .filter(p => p.source === 'direct')
      .map(p => p.permission.id)
  );

  // Get available permissions (not yet assigned)
  const availablePermissions = (moduleDefinition?.permissions || []).filter(
    p => !userPermissionIds.has(p.id)
  );

  const handleSelectPermission = (perm: ModulePermission) => {
    setSelectedPermission(perm);
    setSelectedScope('own');
    setScopeId('');
  };

  const handleConfirmGrant = () => {
    if (!selectedPermission) return;
    onGrantPermission(selectedPermission.id, selectedScope, selectedScope === 'copropiedad' ? scopeId : undefined);
    setSelectedPermission(null);
    setShowAddPermission(false);
    setSelectedScope('own');
    setScopeId('');
  };

  const handleCancelAdd = () => {
    setSelectedPermission(null);
    setShowAddPermission(false);
    setSelectedScope('own');
    setScopeId('');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {moduleItem.module.name}
            </span>
            <code className="text-xs text-gray-400">{moduleItem.module.code}</code>
            {moduleItem.source === 'pool' && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                via {moduleItem.poolName}
              </span>
            )}
          </div>
          {moduleItem.module.description && (
            <p className="text-xs text-gray-500 mt-0.5">{moduleItem.module.description}</p>
          )}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={onRevokeModule}
            disabled={loading}
            className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            Remover
          </button>
        )}
      </div>

      {/* Granular Permissions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-600">Permisos granulares:</p>
          {canEdit && availablePermissions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAddPermission(!showAddPermission)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showAddPermission ? 'Cancelar' : '+ Agregar'}
            </button>
          )}
        </div>

        {/* Add Permission Dropdown */}
        {showAddPermission && canEdit && (
          <div className="mb-2 p-2 rounded border border-blue-200 bg-blue-50">
            {!selectedPermission ? (
              <>
                <p className="text-xs text-blue-700 mb-1">Selecciona un permiso:</p>
                <div className="flex flex-wrap gap-1">
                  {availablePermissions.map((perm) => (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => handleSelectPermission(perm)}
                      disabled={loading}
                      className="text-xs px-2 py-1 rounded border border-blue-300 bg-white text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      title={perm.description || perm.name}
                    >
                      {perm.code}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-700">
                    Permiso: <strong>{selectedPermission.code}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedPermission(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cambiar
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alcance del permiso:
                  </label>
                  <div className="space-y-1">
                    {SCOPE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${
                          selectedScope === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="scope"
                          value={option.value}
                          checked={selectedScope === option.value}
                          onChange={(e) => setSelectedScope(e.target.value as PermissionScope)}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-medium text-gray-900">{option.label}</span>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedScope === 'copropiedad' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ID de Copropiedad:
                    </label>
                    <input
                      type="text"
                      value={scopeId}
                      onChange={(e) => setScopeId(e.target.value)}
                      placeholder="UUID de la copropiedad"
                      className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmGrant}
                    disabled={loading || (selectedScope === 'copropiedad' && !scopeId)}
                    className="flex-1 text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Asignar permiso
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    disabled={loading}
                    className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Permissions */}
        {userPermissions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {userPermissions.map((perm, index) => {
              const scopeLabel = perm.scope === 'own' ? 'propio' : perm.scope === 'copropiedad' ? 'coprop.' : 'todos';
              const scopeColor = perm.scope === 'own' ? 'text-green-600' : perm.scope === 'copropiedad' ? 'text-yellow-600' : 'text-purple-600';
              return (
                <div
                  key={`${perm.permission.id}-${index}`}
                  className="flex items-center gap-1 rounded bg-white border border-gray-200 px-2 py-1"
                  title={perm.scopeId ? `Copropiedad: ${perm.scopeId}` : undefined}
                >
                  <code className="text-xs text-gray-700">{perm.permission.code}</code>
                  <span className={`text-xs ${scopeColor}`}>({scopeLabel})</span>
                  {perm.source === 'pool' && (
                    <span className="text-xs text-blue-500">pool</span>
                  )}
                  {canEdit && perm.source === 'direct' && perm.id && (
                    <button
                      type="button"
                      onClick={() => onRevokePermission(perm.id!)}
                      disabled={loading}
                      className="ml-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Revocar permiso"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Sin permisos asignados</p>
        )}
      </div>
    </div>
  );
}
