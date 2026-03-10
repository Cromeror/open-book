'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PoolForm,
  type PoolFormData,
} from '@/components/organisms';
import { ConfirmDialog } from '@/components/molecules';
import { CapudataRoleList, type CapudataRole } from '@/components/organisms/captudata-role-list';
import {
  CapudataRoleDetail,
  ExternalMemberModal,
  ResourceAccessModal,
  type CapudataRoleMemberInfo,
  type CapudataResourceAccessInfo,
  type ExternalMemberSelection,
  type ResourceAccessSelection,
} from '@/components/organisms/captudata-role-detail';

type ViewMode = 'list' | 'view' | 'create' | 'edit';

export function CapudataRolesManager() {
  // State
  const [roles, setRoles] = useState<CapudataRole[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRole, setSelectedRole] = useState<CapudataRole | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<CapudataRole | null>(null);

  // Member management modal state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  // Resource access modal state
  const [resourceAccessModalOpen, setResourceAccessModalOpen] = useState(false);

  // Members and resource access state
  const [members, setMembers] = useState<CapudataRoleMemberInfo[]>([]);
  const [resourceAccess, setResourceAccess] = useState<CapudataResourceAccessInfo[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);


  // Fetch roles (pools)
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/pools');
      if (!response.ok) {
        throw new Error('Error al cargar roles');
      }

      const data = await response.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // Fetch single role by ID
  const fetchRoleById = useCallback(async (id: string): Promise<CapudataRole | null> => {
    try {
      const response = await fetch(`/api/admin/pools/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar rol');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  // Extract members from role data (external members for Captudata)
  const extractRoleDetails = useCallback((freshData: CapudataRole) => {
    const roleMembers: CapudataRoleMemberInfo[] = (freshData.externalMembers || []).map((m) => ({
      id: m.id,
      userId: m.externalUserId,
      externalId: m.externalUser?.externalId,
      addedAt: m.addedAt || '',
      user: m.externalUser ? {
        id: m.externalUser.id,
        name: m.externalUser.name || m.externalUser.externalId,
        email: m.externalUser.email || '',
      } : undefined,
    }));
    setMembers(roleMembers);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleResourceAccess: CapudataResourceAccessInfo[] = ((freshData.resourceAccess ?? []) as any[]).map((ra) => ({
      id: ra.id,
      resourceId: ra.resourceId,
      resourceHttpMethodId: ra.resourceHttpMethodId,
      grantedAt: ra.grantedAt || '',
      resource: ra.resource,
      resourceHttpMethod: ra.resourceHttpMethod
        ? { id: ra.resourceHttpMethod.id, method: ra.resourceHttpMethod.httpMethod?.method ?? ra.resourceHttpMethod.method }
        : null,
      responseFilter: ra.responseFilter,
    }));
    setResourceAccess(roleResourceAccess);
  }, []);


  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedRole(null);
    setViewMode('create');
    setError(null);
  }, []);

  const handleView = useCallback(
    async (role: CapudataRole) => {
      setLoading(true);
      setError(null);

      const freshData = await fetchRoleById(role.id);
      if (freshData) {
        setSelectedRole(freshData);
        setViewMode('view');
        extractRoleDetails(freshData);
      }
      setLoading(false);
    },
    [fetchRoleById, extractRoleDetails]
  );

  const handleEdit = useCallback(
    async (role: CapudataRole) => {
      setLoading(true);
      setError(null);

      const freshData = await fetchRoleById(role.id);
      if (freshData) {
        setSelectedRole(freshData);
        setViewMode('edit');
        extractRoleDetails(freshData);
      }
      setLoading(false);
    },
    [fetchRoleById, extractRoleDetails]
  );

  const handleDelete = useCallback((role: CapudataRole) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedRole(null);
    setMembers([]);
    setResourceAccess([]);
    setError(null);
  }, []);

  // Create role
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
          throw new Error(errorData.message || 'Error al crear rol');
        }

        setSuccessMessage('Rol creado correctamente');
        setViewMode('list');
        fetchRoles();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [fetchRoles]
  );

  // Update role
  const handleEditSubmit = useCallback(
    async (data: PoolFormData) => {
      if (!selectedRole) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/pools/${selectedRole.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar rol');
        }

        setSuccessMessage('Rol actualizado correctamente');
        setViewMode('list');
        setSelectedRole(null);
        fetchRoles();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedRole, fetchRoles]
  );

  // Confirm delete (soft delete)
  const handleConfirmDelete = useCallback(async () => {
    if (!roleToDelete) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pools/${roleToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar rol');
      }

      setSuccessMessage('Rol eliminado correctamente');
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [roleToDelete, fetchRoles]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  }, []);

  // Toggle role status
  const handleToggleStatus = useCallback(async () => {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pools/${selectedRole.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      setSuccessMessage('Rol desactivado correctamente');
      handleBackToList();
      fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedRole, handleBackToList, fetchRoles]);

  // Member management
  const handleManageMembers = useCallback(() => {
    setMemberModalOpen(true);
  }, []);

  const handleAddExternalMember = useCallback(
    async (selection: ExternalMemberSelection) => {
      if (!selectedRole) return;

      setLoadingMembers(true);
      try {
        const response = await fetch(`/api/admin/pools/${selectedRole.id}/external-members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalUserId: selection.externalUserId,
            organizationCode: selection.organizationCode,
            name: selection.externalUserLabel,
            email: selection.externalUserEmail,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al agregar miembro externo');
        }

        setSuccessMessage(`Miembro "${selection.externalUserLabel}" agregado correctamente`);
        setMemberModalOpen(false);

        const freshData = await fetchRoleById(selectedRole.id);
        if (freshData) {
          setSelectedRole(freshData);
          extractRoleDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingMembers(false);
      }
    },
    [selectedRole, fetchRoleById, extractRoleDetails]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!selectedRole) return;

      try {
        const response = await fetch(
          `/api/admin/pools/${selectedRole.id}/external-members/${userId}`,
          { method: 'DELETE' }
        );

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar miembro');
        }

        setSuccessMessage('Miembro eliminado correctamente');

        const freshData = await fetchRoleById(selectedRole.id);
        if (freshData) {
          setSelectedRole(freshData);
          extractRoleDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [selectedRole, fetchRoleById, extractRoleDetails]
  );

  // Resource access management
  const handleManageResourceAccess = useCallback(() => {
    setResourceAccessModalOpen(true);
  }, []);

  const handleGrantResourceAccess = useCallback(
    async (selection: ResourceAccessSelection) => {
      if (!selectedRole) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/admin/pools/${selectedRole.id}/resource-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceId: selection.resourceId,
            resourceHttpMethodId: selection.resourceHttpMethodId,
            responseFilter: selection.responseFilter,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al asignar acceso');
        }

        setSuccessMessage('Acceso a recurso asignado correctamente');
        setResourceAccessModalOpen(false);

        const freshData = await fetchRoleById(selectedRole.id);
        if (freshData) {
          setSelectedRole(freshData);
          extractRoleDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedRole, fetchRoleById, extractRoleDetails]
  );

  const handleRevokeResourceAccess = useCallback(
    async (accessId: string) => {
      if (!selectedRole) return;

      try {
        const response = await fetch(
          `/api/admin/pools/${selectedRole.id}/resource-access/${accessId}`,
          { method: 'DELETE' }
        );

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al revocar acceso');
        }

        setSuccessMessage('Acceso a recurso revocado correctamente');

        const freshData = await fetchRoleById(selectedRole.id);
        if (freshData) {
          setSelectedRole(freshData);
          extractRoleDetails(freshData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [selectedRole, fetchRoleById, extractRoleDetails]
  );

  // Convert role to form data
  const getFormData = (role: CapudataRole): PoolFormData => ({
    name: role.name,
    description: role.description,
  });

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
        <CapudataRoleList
          roles={roles}
          searchQuery={searchQuery}
          loading={loading}
          selectedId={selectedRole?.id}
          onSearch={handleSearch}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'view' && selectedRole && (
        <CapudataRoleDetail
          role={selectedRole}
          members={members}
          resourceAccess={resourceAccess}
          loadingMembers={loadingMembers}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onBack={handleBackToList}
          onManageMembers={handleManageMembers}
          onRemoveMember={handleRemoveMember}
          onManageResourceAccess={handleManageResourceAccess}
          onRevokeResourceAccess={handleRevokeResourceAccess}
        />
      )}

      {viewMode === 'create' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Crear Rol</h2>
            <p className="text-sm text-gray-500">Ingrese los datos del nuevo rol de Captudata</p>
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

      {viewMode === 'edit' && selectedRole && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Editar Rol</h2>
            <p className="text-sm text-gray-500">{selectedRole.name}</p>
          </div>
          <div className="p-4">
            <PoolForm
              initialData={getFormData(selectedRole)}
              isEditMode
              onSubmit={handleEditSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* External Member Modal */}
      <ExternalMemberModal
        isOpen={memberModalOpen && !!selectedRole}
        roleName={selectedRole?.name}
        loading={loadingMembers}
        existingMemberExternalIds={members.map((m) => m.externalId || m.userId)}
        onConfirm={handleAddExternalMember}
        onCancel={() => setMemberModalOpen(false)}
      />

      {/* Resource Access Modal */}
      <ResourceAccessModal
        isOpen={resourceAccessModalOpen && !!selectedRole}
        roleName={selectedRole?.name}
        loading={loading}
        existingAccess={resourceAccess.map((ra) => ({
          resourceId: ra.resourceId,
          resourceHttpMethodId: ra.resourceHttpMethodId,
        }))}
        onConfirm={handleGrantResourceAccess}
        onCancel={() => setResourceAccessModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Eliminar Rol"
        message={`¿Esta seguro de eliminar el rol "${roleToDelete?.name}"? Esta accion marcara el rol como inactivo.`}
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

export default CapudataRolesManager;
