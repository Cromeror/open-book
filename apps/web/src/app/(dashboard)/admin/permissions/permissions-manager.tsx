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
  permissions: Array<{
    id?: string;
    permission: {
      id: string;
      code: string;
      name: string;
      module: Module;
    };
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
    loadUserPermissions(user.id);
  };

  const handleGrantPermission = async (modulePermissionId: string) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/permissions/users/${selectedUser.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulePermissionId }),
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

  // Group permissions by module
  const permissionsByModule = groupPermissionsByModule(userPermissions?.permissions || []);

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
          <div className="p-4 space-y-4 max-h-[550px] overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-900">Permisos por modulo</h3>

            {/* Permissions grouped by module */}
            {modules.map((module) => {
              const modulePerms = permissionsByModule.get(module.id) || [];
              return (
                <ModulePermissionsCard
                  key={module.id}
                  module={module}
                  assignedPermissions={modulePerms}
                  onGrantPermission={handleGrantPermission}
                  onRevokePermission={handleRevokePermission}
                  loading={loading}
                />
              );
            })}

            {/* Pool info */}
            {userPermissions?.permissions.some(p => p.source === 'pool') && (
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                Los permisos marcados como &quot;via Pool&quot; son heredados y no pueden ser removidos directamente.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function groupPermissionsByModule(
  permissions: UserPermissionsData['permissions']
): Map<string, UserPermissionsData['permissions']> {
  const map = new Map<string, UserPermissionsData['permissions']>();
  for (const perm of permissions) {
    const moduleId = perm.permission.module.id;
    const existing = map.get(moduleId) || [];
    existing.push(perm);
    map.set(moduleId, existing);
  }
  return map;
}

// Component for displaying permissions per module
interface ModulePermissionsCardProps {
  module: Module;
  assignedPermissions: UserPermissionsData['permissions'];
  onGrantPermission: (modulePermissionId: string) => void;
  onRevokePermission: (userPermissionId: string) => void;
  loading: boolean;
}

function ModulePermissionsCard({
  module,
  assignedPermissions,
  onGrantPermission,
  onRevokePermission,
  loading,
}: ModulePermissionsCardProps) {
  const [showAdd, setShowAdd] = useState(false);
  const hasPermissions = assignedPermissions.length > 0;

  // Get assigned permission IDs (direct only)
  const assignedPermissionIds = new Set(
    assignedPermissions
      .filter(p => p.source === 'direct')
      .map(p => p.permission.id)
  );

  // All assigned permission IDs (direct + pool)
  const allAssignedIds = new Set(assignedPermissions.map(p => p.permission.id));

  // Get available permissions (not yet assigned via any source)
  const availablePermissions = (module.permissions || []).filter(
    p => !allAssignedIds.has(p.id)
  );

  return (
    <div className={`rounded-lg border p-3 ${hasPermissions ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{module.name}</span>
          <code className="text-xs text-gray-400">{module.code}</code>
          {hasPermissions && (
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
              activo
            </span>
          )}
        </div>
        {availablePermissions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showAdd ? 'Cancelar' : '+ Agregar'}
          </button>
        )}
      </div>

      {/* Add Permission */}
      {showAdd && (
        <div className="mt-2 p-2 rounded border border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-700 mb-1">Selecciona un permiso:</p>
          <div className="flex flex-wrap gap-1">
            {availablePermissions.map((perm) => (
              <button
                key={perm.id}
                type="button"
                onClick={() => {
                  onGrantPermission(perm.id);
                  setShowAdd(false);
                }}
                disabled={loading}
                className="text-xs px-2 py-1 rounded border border-blue-300 bg-white text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                title={perm.description || perm.name}
              >
                {perm.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Permissions */}
      {hasPermissions && (
        <div className="mt-2 flex flex-wrap gap-1">
          {assignedPermissions.map((perm, index) => (
            <div
              key={`${perm.permission.id}-${index}`}
              className="flex items-center gap-1 rounded bg-white border border-gray-200 px-2 py-1"
            >
              <code className="text-xs text-gray-700">{perm.permission.code}</code>
              {perm.source === 'pool' && (
                <span className="text-xs text-blue-500" title={perm.poolName}>pool</span>
              )}
              {perm.source === 'direct' && perm.id && (
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
          ))}
        </div>
      )}
    </div>
  );
}
