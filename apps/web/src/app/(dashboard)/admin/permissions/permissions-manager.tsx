'use client';

import { useState, useCallback } from 'react';

interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
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

interface UserModule {
  id: string;
  moduleId: string;
  module: Module;
}

interface UserPermission {
  id: string;
  moduleId: string;
  action: string;
  scope: string;
  scopeId?: string;
  module: Module;
}

interface UserPermissionsData {
  modules: UserModule[];
  permissions: UserPermission[];
  pools: Array<{
    id: string;
    name: string;
    modules: UserModule[];
    permissions: UserPermission[];
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

  const filteredUsers = (users || []).filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadUserPermissions = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/permissions/users/${userId}?type=permissions`);
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
    loadUserPermissions(user.id);
  };

  const handleGrantModule = async (moduleId: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/permissions/users/${selectedUser.id}?type=modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al asignar modulo');
      }

      setSuccessMessage('Modulo asignado correctamente');
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
        `/api/admin/permissions/users/${selectedUser.id}?type=modules&targetId=${moduleId}`,
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

  const handleGrantPermission = async (moduleId: string, action: string, scope: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/permissions/users/${selectedUser.id}?type=permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, action, scope }),
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

  const handleRevokePermission = async (permissionId: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/permissions/users/${selectedUser.id}?type=permissions&targetId=${permissionId}`,
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

  const getUserModuleIds = () => {
    if (!userPermissions) return new Set<string>();
    return new Set(userPermissions.modules.map((m) => m.moduleId));
  };

  const userModuleIds = getUserModuleIds();

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
        <div className="max-h-96 overflow-y-auto">
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
                        {user.lastLoginAt && (
                          <p className="text-xs text-gray-400">
                            Ultimo acceso: {new Date(user.lastLoginAt).toLocaleDateString()}
                          </p>
                        )}
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

      {/* User Permissions */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedUser
              ? `Permisos de ${selectedUser.firstName || selectedUser.email}`
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
        ) : loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Cargando permisos...
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Modules */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Modulos Asignados</h3>
              <div className="space-y-2">
                {modules.map((module) => {
                  const hasAccess = userModuleIds.has(module.id);
                  return (
                    <div
                      key={module.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          hasAccess ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-sm text-gray-900">{module.name}</span>
                        <code className="text-xs text-gray-400">{module.code}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => hasAccess ? handleRevokeModule(module.id) : handleGrantModule(module.id)}
                        disabled={loading}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          hasAccess
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50`}
                      >
                        {hasAccess ? 'Revocar' : 'Asignar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Granular Permissions */}
            {userPermissions && userPermissions.permissions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Permisos Granulares</h3>
                <div className="space-y-2">
                  {userPermissions.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-2"
                    >
                      <div>
                        <span className="text-sm text-gray-900">
                          {perm.module.name}: <code className="text-xs">{perm.action}</code>
                        </span>
                        <span className="ml-2 rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-600">
                          {perm.scope}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevokePermission(perm.id)}
                        disabled={loading}
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        Revocar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Permission Form */}
            <AddPermissionForm
              modules={modules.filter((m) => userModuleIds.has(m.id))}
              onGrant={handleGrantPermission}
              loading={loading}
            />

            {/* Pool Memberships */}
            {userPermissions && userPermissions.pools?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Permisos via Pools</h3>
                <div className="space-y-2">
                  {userPermissions.pools.map((pool) => (
                    <div
                      key={pool.id}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                    >
                      <p className="text-sm font-medium text-blue-900">{pool.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {pool.modules.map((m) => (
                          <span
                            key={m.id}
                            className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700"
                          >
                            {m.module.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface AddPermissionFormProps {
  modules: Module[];
  onGrant: (moduleId: string, action: string, scope: string) => void;
  loading: boolean;
}

function AddPermissionForm({ modules, onGrant, loading }: AddPermissionFormProps) {
  const [moduleId, setModuleId] = useState('');
  const [action, setAction] = useState('read');
  const [scope, setScope] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;
    onGrant(moduleId, action, scope);
    setModuleId('');
    setAction('read');
    setScope('all');
  };

  if (modules.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Asigna al menos un modulo para configurar permisos granulares.
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Agregar Permiso</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Seleccionar modulo</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="create">create</option>
          <option value="read">read</option>
          <option value="update">update</option>
          <option value="delete">delete</option>
          <option value="manage">manage</option>
          <option value="export">export</option>
        </select>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="all">all</option>
          <option value="copropiedad">copropiedad</option>
          <option value="own">own</option>
        </select>
        <button
          type="submit"
          disabled={!moduleId || loading}
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
