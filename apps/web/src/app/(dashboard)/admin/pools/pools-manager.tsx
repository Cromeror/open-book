'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PoolList,
  PoolForm,
  PoolDetail,
  type UserPool,
  type PoolFormData,
  type PoolMemberInfo,
  type PoolModuleInfo,
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

  // Member/Module management modal state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);

  // Members and modules state
  const [members, setMembers] = useState<PoolMemberInfo[]>([]);
  const [modules, setModules] = useState<PoolModuleInfo[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

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

      // Fetch fresh data from API
      const freshData = await fetchPoolById(pool.id);
      if (freshData) {
        setSelectedPool(freshData);
        setViewMode('view');

        // Extract members and modules from response
        const poolMembers: PoolMemberInfo[] = (freshData.members || []).map((m: { id: string; userId: string; addedAt?: string; user?: { id: string; name: string; email: string } }) => ({
          id: m.id,
          userId: m.userId,
          addedAt: m.addedAt || '',
          user: m.user,
        }));
        setMembers(poolMembers);

        const poolModules: PoolModuleInfo[] = (freshData.modules || []).map((pm: { id: string; moduleId: string; grantedAt?: string; module?: { id: string; name: string; code: string; description?: string } }) => ({
          id: pm.id,
          moduleId: pm.moduleId,
          grantedAt: pm.grantedAt || '',
          module: pm.module,
        }));
        setModules(poolModules);
      }
      setLoading(false);
    },
    [fetchPoolById]
  );

  const handleEdit = useCallback(
    async (pool: UserPool) => {
      setLoading(true);
      setError(null);

      const freshData = await fetchPoolById(pool.id);
      if (freshData) {
        setSelectedPool(freshData);
        setViewMode('edit');

        // Extract modules from response for the edit form
        const poolModules: PoolModuleInfo[] = (freshData.modules || []).map((pm: { id: string; moduleId: string; grantedAt?: string; module?: { id: string; name: string; code: string; description?: string } }) => ({
          id: pm.id,
          moduleId: pm.moduleId,
          grantedAt: pm.grantedAt || '',
          module: pm.module,
        }));
        setModules(poolModules);
      }
      setLoading(false);
    },
    [fetchPoolById]
  );

  const handleDelete = useCallback((pool: UserPool) => {
    setPoolToDelete(pool);
    setDeleteDialogOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedPool(null);
    setMembers([]);
    setModules([]);
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
      // Since the API doesn't have a toggle endpoint, we'll use PATCH to update isActive
      const response = await fetch(`/api/admin/pools/${selectedPool.id}`, {
        method: 'DELETE', // Using DELETE as it deactivates the pool
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

        // Refresh pool data
        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          const poolMembers: PoolMemberInfo[] = (freshData.members || []).map((m: { id: string; userId: string; addedAt?: string; user?: { id: string; name: string; email: string } }) => ({
            id: m.id,
            userId: m.userId,
            addedAt: m.addedAt || '',
            user: m.user,
          }));
          setMembers(poolMembers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingMembers(false);
      }
    },
    [selectedPool, fetchPoolById]
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

        // Refresh pool data
        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          const poolMembers: PoolMemberInfo[] = (freshData.members || []).map((m: { id: string; userId: string; addedAt?: string; user?: { id: string; name: string; email: string } }) => ({
            id: m.id,
            userId: m.userId,
            addedAt: m.addedAt || '',
            user: m.user,
          }));
          setMembers(poolMembers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [selectedPool, fetchPoolById]
  );

  // Module management
  const handleManageModules = useCallback(() => {
    setModuleModalOpen(true);
  }, []);

  // Get permissions for a module from local data (no API call needed)
  const fetchModulePermissions = useCallback(async (moduleCode: string): Promise<PermissionOption[]> => {
    // Find the module in availableModules
    const module = availableModules.find(m => m.code === moduleCode);
    if (!module || !module.permissions) {
      return [];
    }

    // Return the permissions from the module
    return module.permissions.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
    }));
  }, [availableModules]);

  // Add module with permissions (used from modal)
  const handleAddModuleWithPermissions = useCallback(
    async (moduleId: string, permissionIds: string[]) => {
      if (!selectedPool || !moduleId) return;

      setLoadingModules(true);
      try {
        // Step 1: Add module to pool
        const moduleResponse = await fetch(`/api/admin/pools/${selectedPool.id}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId }),
        });

        if (!moduleResponse.ok) {
          const errorData = await moduleResponse.json();
          throw new Error(errorData.message || 'Error al agregar modulo');
        }

        // Step 2: Add permissions for the module
        for (const permissionId of permissionIds) {
          const permResponse = await fetch(`/api/admin/pools/${selectedPool.id}/permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              modulePermissionId: permissionId,
              scope: 'all',
            }),
          });

          if (!permResponse.ok) {
            console.error('Error adding permission:', permissionId);
          }
        }

        setSuccessMessage('Modulo y permisos agregados correctamente');
        setModuleModalOpen(false);

        // Refresh pool data
        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          const poolModules: PoolModuleInfo[] = (freshData.modules || []).map((pm: { id: string; moduleId: string; grantedAt?: string; module?: { id: string; name: string; code: string; description?: string } }) => ({
            id: pm.id,
            moduleId: pm.moduleId,
            grantedAt: pm.grantedAt || '',
            module: pm.module,
          }));
          setModules(poolModules);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingModules(false);
      }
    },
    [selectedPool, fetchPoolById]
  );

  // Add module by ID only (used from form - without permissions)
  const handleAddModuleById = useCallback(
    async (moduleId: string) => {
      if (!selectedPool || !moduleId) return;

      setLoadingModules(true);
      try {
        const response = await fetch(`/api/admin/pools/${selectedPool.id}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al agregar modulo');
        }

        setSuccessMessage('Modulo agregado correctamente');
        setModuleModalOpen(false);

        // Refresh pool data
        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          const poolModules: PoolModuleInfo[] = (freshData.modules || []).map((pm: { id: string; moduleId: string; grantedAt?: string; module?: { id: string; name: string; code: string; description?: string } }) => ({
            id: pm.id,
            moduleId: pm.moduleId,
            grantedAt: pm.grantedAt || '',
            module: pm.module,
          }));
          setModules(poolModules);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingModules(false);
      }
    },
    [selectedPool, fetchPoolById]
  );

  const handleRemoveModule = useCallback(
    async (moduleId: string) => {
      if (!selectedPool) return;

      try {
        const response = await fetch(
          `/api/admin/pools/${selectedPool.id}/modules/${moduleId}`,
          { method: 'DELETE' }
        );

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar modulo');
        }

        setSuccessMessage('Modulo eliminado correctamente');

        // Refresh pool data
        const freshData = await fetchPoolById(selectedPool.id);
        if (freshData) {
          setSelectedPool(freshData);
          const poolModules: PoolModuleInfo[] = (freshData.modules || []).map((pm: { id: string; moduleId: string; grantedAt?: string; module?: { id: string; name: string; code: string; description?: string } }) => ({
            id: pm.id,
            moduleId: pm.moduleId,
            grantedAt: pm.grantedAt || '',
            module: pm.module,
          }));
          setModules(poolModules);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [selectedPool, fetchPoolById]
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

  // Filter modules that are not already assigned
  const filteredModules = availableModules.filter(
    (mod) => !modules.some((m) => m.moduleId === mod.id)
  );

  // Transform users to SelectOption format
  const userOptions: SelectOption[] = filteredUsers.map((user) => ({
    id: user.id,
    label: user.name,
    description: user.email,
  }));

  // Transform modules to ModuleOption format
  const moduleOptions: ModuleOption[] = filteredModules.map((mod) => ({
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
          modules={modules}
          loadingMembers={loadingMembers}
          loadingModules={loadingModules}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onBack={handleBackToList}
          onManageMembers={handleManageMembers}
          onManageModules={handleManageModules}
          onRemoveMember={handleRemoveMember}
          onRemoveModule={handleRemoveModule}
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
              assignedModules={modules}
              availableModules={availableModules}
              onSubmit={handleEditSubmit}
              onCancel={handleBackToList}
              onAddModule={handleAddModuleById}
              onRemoveModule={handleRemoveModule}
              loading={loading || loadingModules}
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

      {/* Module Modal with Permissions */}
      <ModulePermissionsModal
        isOpen={moduleModalOpen && !!selectedPool}
        title="Agregar Modulo"
        subtitle={selectedPool?.name}
        modules={moduleOptions}
        emptyModulesMessage="No hay modulos disponibles para agregar"
        loading={loadingModules}
        onFetchPermissions={fetchModulePermissions}
        onConfirm={handleAddModuleWithPermissions}
        onCancel={() => setModuleModalOpen(false)}
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
