'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PoolList,
  PoolForm,
  PoolDetail,
  type UserPool,
  type PoolFormData,
  type PoolMemberInfo,
  type PoolPermissionInfo,
} from '@/components/organisms';
import {
  ConfirmDialog,
  SelectModal,
  ModulePermissionsModal,
  type SelectOption,
  type ModuleOption,
  type PermissionOption,
} from '@/components/molecules';

type ViewMode = 'list' | 'view' | 'create' | 'edit';

interface UserForSelect {
  id: string;
  name: string;
  email: string;
}

interface ModulePermissionForSelect {
  id: string;
  code: string;
  name: string;
  description?: string;
}

interface ModuleForSelect {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  permissions?: ModulePermissionForSelect[];
}

interface PoolsManagerProps {
  initialModules?: ModuleForSelect[];
}

export function PoolsManager({ initialModules = [] }: PoolsManagerProps) {
  // State
  const [pools, setPools] = useState<UserPool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPool, setSelectedPool] = useState<UserPool | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState<UserPool | null>(null);

  // Member/Permission management modal state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  // Members and permissions state
  const [members, setMembers] = useState<PoolMemberInfo[]>([]);
  const [permissions, setPermissions] = useState<PoolPermissionInfo[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Available users and modules for selection
  const [availableUsers, setAvailableUsers] = useState<UserForSelect[]>([]);
  const [availableModules] = useState<ModuleForSelect[]>(initialModules);

  // Fetch pools
  const fetchPools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/pools');
      if (!response.ok) {
        throw new Error('Error al cargar pools');
      }

      const data = await response.json();
      setPools(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // Fetch single pool by ID
  const fetchPoolById = useCallback(async (id: string): Promise<UserPool | null> => {
    try {
      const response = await fetch(`/api/admin/pools/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar pool');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  // Extract members and permissions from pool data
  const extractPoolDetails = useCallback((freshData: UserPool) => {
    const poolMembers: PoolMemberInfo[] = (freshData.members || []).map((m: { id: string; userId: string; addedAt?: string; user?: { id: string; name: string; email: string } }) => ({
      id: m.id,
      userId: m.userId,
      addedAt: m.addedAt || '',
      user: m.user,
    }));
    setMembers(poolMembers);

    const poolPerms: PoolPermissionInfo[] = (freshData.permissions || []).map((pp: { id: string; modulePermissionId?: string; grantedAt?: string; modulePermission?: { id: string; code: string; name: string; module?: { id: string; name: string; code: string } } }) => ({
      id: pp.id,
      modulePermissionId: pp.modulePermissionId || '',
      grantedAt: pp.grantedAt || '',
      modulePermission: pp.modulePermission,
    }));
    setPermissions(poolPerms);
  }, []);

  // Fetch available users
  const fetchAvailableUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      const data = await response.json();
      setAvailableUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setAvailableUsers([]);
    }
  }, []);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedPool(null);
    setViewMode('create');
    setError(null);
  }, []);

  const handleView = useCallback(
    async (pool: UserPool) => {
      setLoading(true);
      setError(null);

      const freshData = await fetchPoolById(pool.id);
      if (freshData) {
        setSelectedPool(freshData);
        setViewMode('view');
        extractPoolDetails(freshData);
      }
      setLoading(false);
    },
    [fetchPoolById, extractPoolDetails]
  );

  const handleEdit = useCallback(
    async (pool: UserPool) => {
      setLoading(true);
      setError(null);

      const freshData = await fetchPoolById(pool.id);
      if (freshData) {
        setSelectedPool(freshData);
        setViewMode('edit');
        extractPoolDetails(freshData);
      }
      setLoading(false);
    },
    [fetchPoolById, extractPoolDetails]
  );

  const handleDelete = useCallback((pool: UserPool) => {
    setPoolToDelete(pool);
    setDeleteDialogOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedPool(null);
    setMembers([]);
    setPermissions([]);
    setError(null);
  }, []);

  // Create pool
  const handleCreateSubmit = useCallback(
    async (data: PoolFormData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/pools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear pool');
        }

        setSuccessMessage('Pool creado correctamente');
        setViewMode('list');
        fetchPools();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [fetchPools]
  );

  // Update pool
  const handleEditSubmit = useCallback(
    async (data: PoolFormData) => {
      if (!selectedPool) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/pools/${selectedPool.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar pool');
        }

        setSuccessMessage('Pool actualizado correctamente');
        setViewMode('list');
        setSelectedPool(null);
        fetchPools();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedPool, fetchPools]
  );

  // Confirm delete (soft delete)
  const handleConfirmDelete = useCallback(async () => {
    if (!poolToDelete) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pools/${poolToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar pool');
      }

      setSuccessMessage('Pool eliminado correctamente');
      setDeleteDialogOpen(false);
      setPoolToDelete(null);
      fetchPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [poolToDelete, fetchPools]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setPoolToDelete(null);
  }, []);

  // Toggle pool status
  const handleToggleStatus = useCallback(async () => {
    if (!selectedPool) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pools/${selectedPool.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      setSuccessMessage('Pool desactivado correctamente');
      handleBackToList();
      fetchPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedPool, handleBackToList, fetchPools]);

  // Member management
  const handleManageMembers = useCallback(() => {
    fetchAvailableUsers();
    setMemberModalOpen(true);
  }, [fetchAvailableUsers]);

  const handleAddMemberById = useCallback(
    async (userId: string) => {
      if (!selectedPool || !userId) return;

      setLoadingMembers(true);
      try {
        const response = await fetch(`/api/admin/pools/${selectedPool.id}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al agregar miembro');
        }

        setSuccessMessage('Miembro agregado correctamente');
        setMemberModalOpen(false);

        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          extractPoolDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingMembers(false);
      }
    },
    [selectedPool, fetchPoolById, extractPoolDetails]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!selectedPool) return;

      try {
        const response = await fetch(
          `/api/admin/pools/${selectedPool.id}/members/${userId}`,
          { method: 'DELETE' }
        );

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar miembro');
        }

        setSuccessMessage('Miembro eliminado correctamente');

        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          extractPoolDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [selectedPool, fetchPoolById, extractPoolDetails]
  );

  // Permission management
  const handleManagePermissions = useCallback(() => {
    setPermissionModalOpen(true);
  }, []);

  // Get permissions for a module from local data
  const fetchModulePermissions = useCallback(async (moduleCode: string): Promise<PermissionOption[]> => {
    const module = availableModules.find(m => m.code === moduleCode);
    if (!module || !module.permissions) {
      return [];
    }

    return module.permissions.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
    }));
  }, [availableModules]);

  // Grant permissions to pool directly (no module-first step)
  const handleGrantPermissions = useCallback(
    async (_moduleId: string, permissionIds: string[]) => {
      if (!selectedPool) return;

      setLoadingPermissions(true);
      try {
        for (const permissionId of permissionIds) {
          const permResponse = await fetch(`/api/admin/pools/${selectedPool.id}/permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modulePermissionId: permissionId }),
          });

          if (!permResponse.ok) {
            console.error('Error adding permission:', permissionId);
          }
        }

        setSuccessMessage('Permisos asignados correctamente');
        setPermissionModalOpen(false);

        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          extractPoolDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingPermissions(false);
      }
    },
    [selectedPool, fetchPoolById, extractPoolDetails]
  );

  const handleRevokePermission = useCallback(
    async (permissionId: string) => {
      if (!selectedPool) return;

      try {
        const response = await fetch(
          `/api/admin/pools/${selectedPool.id}/permissions/${permissionId}`,
          { method: 'DELETE' }
        );

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al revocar permiso');
        }

        setSuccessMessage('Permiso revocado correctamente');

        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          extractPoolDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [selectedPool, fetchPoolById, extractPoolDetails]
  );

  // Convert pool to form data
  const getFormData = (pool: UserPool): PoolFormData => ({
    name: pool.name,
    description: pool.description,
  });

  // Filter users that are not already members
  const filteredUsers = availableUsers.filter(
    (user) => !members.some((m) => m.userId === user.id)
  );

  // Transform users to SelectOption format
  const userOptions: SelectOption[] = filteredUsers.map((user) => ({
    id: user.id,
    label: user.name,
    description: user.email,
  }));

  // Transform modules to ModuleOption format (for permission assignment modal)
  const moduleOptions: ModuleOption[] = availableModules.map((mod) => ({
    id: mod.id,
    code: mod.code,
    name: mod.name,
    description: mod.description,
  }));

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <PoolList
          pools={pools}
          searchQuery={searchQuery}
          loading={loading}
          selectedId={selectedPool?.id}
          onSearch={handleSearch}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'view' && selectedPool && (
        <PoolDetail
          pool={selectedPool}
          members={members}
          permissions={permissions}
          loadingMembers={loadingMembers}
          loadingPermissions={loadingPermissions}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onBack={handleBackToList}
          onManageMembers={handleManageMembers}
          onManagePermissions={handleManagePermissions}
          onRemoveMember={handleRemoveMember}
          onRevokePermission={handleRevokePermission}
        />
      )}

      {viewMode === 'create' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Crear Pool</h2>
            <p className="text-sm text-gray-500">Ingrese los datos del nuevo pool de usuarios</p>
          </div>
          <div className="p-4">
            <PoolForm
              onSubmit={handleCreateSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {viewMode === 'edit' && selectedPool && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Editar Pool</h2>
            <p className="text-sm text-gray-500">{selectedPool.name}</p>
          </div>
          <div className="p-4">
            <PoolForm
              initialData={getFormData(selectedPool)}
              isEditMode
              onSubmit={handleEditSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Member Modal */}
      <SelectModal
        isOpen={memberModalOpen && !!selectedPool}
        title="Agregar Miembro"
        subtitle={selectedPool?.name}
        selectLabel="Seleccionar Usuario"
        placeholder="Seleccione un usuario..."
        options={userOptions}
        emptyMessage="No hay usuarios disponibles para agregar"
        loading={loadingMembers}
        onConfirm={handleAddMemberById}
        onCancel={() => setMemberModalOpen(false)}
      />

      {/* Permission Modal (select module, then permissions) */}
      <ModulePermissionsModal
        isOpen={permissionModalOpen && !!selectedPool}
        title="Agregar Permisos"
        subtitle={selectedPool?.name}
        modules={moduleOptions}
        emptyModulesMessage="No hay modulos disponibles"
        loading={loadingPermissions}
        onFetchPermissions={fetchModulePermissions}
        onConfirm={handleGrantPermissions}
        onCancel={() => setPermissionModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Eliminar Pool"
        message={`¿Esta seguro de eliminar el pool "${poolToDelete?.name}"? Esta accion marcara el pool como inactivo.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={loading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default PoolsManager;
