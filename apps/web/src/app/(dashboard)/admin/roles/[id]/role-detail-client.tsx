'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CapudataRoleDetail,
  ExternalMemberModal,
  ResourceAccessModal,
  type CapudataRoleMemberInfo,
  type CapudataResourceAccessInfo,
  type ExternalMemberSelection,
  type ResourceAccessSelection,
  type ResourceAccessInitialData,
} from '@/components/organisms/captudata-role-detail';
import type { CapudataRole } from '@/components/organisms/captudata-role-list';

interface RoleDetailClientProps {
  role: CapudataRole;
}

function extractMembers(role: CapudataRole): CapudataRoleMemberInfo[] {
  return (role.externalMembers || []).map((m) => ({
    id: m.id,
    userId: m.externalUserId,
    externalId: m.externalUser?.externalId,
    addedAt: m.addedAt || '',
    clientName: m.externalUser?.clientName || undefined,
    user: m.externalUser
      ? {
          id: m.externalUser.id,
          name: m.externalUser.name || m.externalUser.externalId,
          email: m.externalUser.email || '',
        }
      : undefined,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractResourceAccess(role: CapudataRole): CapudataResourceAccessInfo[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((role.resourceAccess ?? []) as any[]).map((ra) => ({
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
}

export function RoleDetailClient({ role: initialRole }: RoleDetailClientProps) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [members, setMembers] = useState<CapudataRoleMemberInfo[]>(() => extractMembers(initialRole));
  const [resourceAccess, setResourceAccess] = useState<CapudataResourceAccessInfo[]>(() => extractResourceAccess(initialRole));
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [resourceAccessModalOpen, setResourceAccessModalOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<ResourceAccessInitialData | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  const refreshRole = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/pools/${role.id}`);
      if (!response.ok) throw new Error('Error al recargar rol');
      const freshData = await response.json();
      setRole(freshData);
      setMembers(extractMembers(freshData));
      setResourceAccess(extractResourceAccess(freshData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [role.id]);

  const handleToggleStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/pools/${role.id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }
      setSuccessMessage('Rol desactivado correctamente');
      router.push('/admin/roles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [role.id, router]);

  const handleAddExternalMember = useCallback(
    async (selection: ExternalMemberSelection) => {
      setLoadingMembers(true);
      try {
        const response = await fetch(`/api/admin/pools/${role.id}/external-members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalUserId: selection.externalUserId,
            organizationCode: selection.organizationCode,
            name: selection.externalUserLabel,
            email: selection.externalUserEmail,
            clientId: selection.clientId,
            clientName: selection.clientName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al agregar miembro externo');
        }

        setSuccessMessage(`Miembro "${selection.externalUserLabel}" agregado correctamente`);
        setMemberModalOpen(false);
        await refreshRole();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingMembers(false);
      }
    },
    [role.id, refreshRole]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(`/api/admin/pools/${role.id}/external-members/${userId}`, {
          method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar miembro');
        }
        setSuccessMessage('Miembro eliminado correctamente');
        await refreshRole();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [role.id, refreshRole]
  );

  const handleEditResourceAccess = useCallback((access: CapudataResourceAccessInfo) => {
    setEditingAccess({
      accessId: access.id,
      resourceId: access.resourceId,
      resourceHttpMethodId: access.resourceHttpMethodId,
      responseFilter: access.responseFilter,
    });
    setResourceAccessModalOpen(true);
  }, []);

  const handleResourceAccessConfirm = useCallback(
    async (selection: ResourceAccessSelection) => {
      setLoading(true);
      try {
        if (editingAccess) {
          // Update existing access (only response filter can change)
          const response = await fetch(`/api/admin/pools/${role.id}/resource-access/${editingAccess.accessId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resourceHttpMethodId: selection.resourceHttpMethodId,
              responseFilter: selection.responseFilter,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar acceso');
          }

          setSuccessMessage('Acceso a recurso actualizado correctamente');
        } else {
          // Grant new access
          const response = await fetch(`/api/admin/pools/${role.id}/resource-access`, {
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
        }

        setResourceAccessModalOpen(false);
        setEditingAccess(null);
        await refreshRole();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [role.id, editingAccess, refreshRole]
  );

  const handleRevokeResourceAccess = useCallback(
    async (accessId: string) => {
      try {
        const response = await fetch(`/api/admin/pools/${role.id}/resource-access/${accessId}`, {
          method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al revocar acceso');
        }
        setSuccessMessage('Acceso a recurso revocado correctamente');
        await refreshRole();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [role.id, refreshRole]
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{successMessage}</div>
      )}

      <CapudataRoleDetail
        role={role}
        members={members}
        resourceAccess={resourceAccess}
        loadingMembers={loadingMembers}
        loading={loading}
        onEdit={(r) => router.push(`/admin/roles/${r.id}/edit`)}
        onToggleStatus={handleToggleStatus}
        onBack={() => router.push('/admin/roles')}
        onManageMembers={() => setMemberModalOpen(true)}
        onRemoveMember={handleRemoveMember}
        onManageResourceAccess={() => {
          setEditingAccess(null);
          setResourceAccessModalOpen(true);
        }}
        onEditResourceAccess={handleEditResourceAccess}
        onRevokeResourceAccess={handleRevokeResourceAccess}
      />

      <ExternalMemberModal
        isOpen={memberModalOpen}
        roleName={role.name}
        loading={loadingMembers}
        existingMemberExternalIds={members.map((m) => m.externalId || m.userId)}
        onConfirm={handleAddExternalMember}
        onCancel={() => setMemberModalOpen(false)}
      />

      <ResourceAccessModal
        isOpen={resourceAccessModalOpen}
        roleName={role.name}
        loading={loading}
        existingAccess={resourceAccess.map((ra) => ({
          resourceId: ra.resourceId,
          resourceHttpMethodId: ra.resourceHttpMethodId,
        }))}
        initialData={editingAccess}
        onConfirm={handleResourceAccessConfirm}
        onCancel={() => {
          setResourceAccessModalOpen(false);
          setEditingAccess(null);
        }}
      />
    </div>
  );
}
