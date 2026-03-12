'use client';

import { Section } from '@/components/molecules';
import type { CapudataRole } from '../captudata-role-list';

export interface CapudataRoleMemberInfo {
  id: string;
  userId: string;
  /** Original external system ID (e.g. Captudata user ID) */
  externalId?: string;
  addedAt: string;
  clientName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CapudataResourceAccessInfo {
  id: string;
  resourceId: string;
  resourceHttpMethodId?: string | null;
  grantedAt: string;
  resource?: {
    id: string;
    code: string;
    name: string;
  };
  resourceHttpMethod?: {
    id: string;
    method: string;
  } | null;
  responseFilter?: {
    field: string;
    type: 'include' | 'exclude';
    values: string[];
  } | null;
}

export interface CapudataRoleDetailProps {
  role: CapudataRole;
  members: CapudataRoleMemberInfo[];
  resourceAccess: CapudataResourceAccessInfo[];
  loadingMembers?: boolean;
  loading?: boolean;
  onEdit: (role: CapudataRole) => void;
  onToggleStatus: () => void;
  onBack: () => void;
  onManageMembers: () => void;
  onRemoveMember: (userId: string) => void;
  onManageResourceAccess: () => void;
  onRevokeResourceAccess: (accessId: string) => void;
}

export function CapudataRoleDetail({
  role,
  members,
  resourceAccess,
  loadingMembers = false,
  loading = false,
  onEdit,
  onToggleStatus,
  onBack,
  onManageMembers,
  onRemoveMember,
  onManageResourceAccess,
  onRevokeResourceAccess,
}: CapudataRoleDetailProps) {
  // Group resource access by resource
  const accessByResource = new Map<string, CapudataResourceAccessInfo[]>();
  for (const access of resourceAccess) {
    const resourceCode = access.resource?.code || 'unknown';
    const existing = accessByResource.get(resourceCode) || [];
    existing.push(access);
    accessByResource.set(resourceCode, existing);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{role.name}</h1>
            <p className="text-sm text-gray-500">
              {role.description || 'Sin descripcion'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={() => onEdit(role)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
              role.isActive
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {role.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      {/* Resource Access Section */}
      <Section
        title={<>Acceso a Recursos <span className="text-sm font-normal text-gray-500">({resourceAccess.length})</span></>}
        customHeader={
          <button
            type="button"
            onClick={onManageResourceAccess}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Agregar Acceso
          </button>
        }
      >
        {resourceAccess.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay accesos a recursos configurados para este rol</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(accessByResource.entries()).map(([resourceCode, accessEntries]) => {
              const resourceName = accessEntries[0]?.resource?.name || resourceCode;
              return (
                <div key={resourceCode} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">{resourceName}</span>
                    <code className="text-xs text-gray-400">{resourceCode}</code>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {accessEntries.map((access) => (
                      <div
                        key={access.id}
                        className="flex items-center gap-1 rounded bg-white border border-gray-200 px-2 py-1"
                      >
                        <code className="text-xs text-gray-700">
                          {access.resourceHttpMethod
                            ? access.resourceHttpMethod.method
                            : 'ALL'}
                        </code>
                        {access.responseFilter && (
                          <span className="text-xs text-blue-500" title={`Filtro: ${access.responseFilter.type} ${access.responseFilter.field}`}>
                            (filtrado)
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onRevokeResourceAccess(access.id)}
                          className="ml-1 text-red-500 hover:text-red-700"
                          title="Revocar acceso"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Members Section */}
      <Section
        title={<>Miembros del Rol <span className="text-sm font-normal text-gray-500">({members.length})</span></>}
        customHeader={
          <button
            type="button"
            onClick={onManageMembers}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Agregar Miembro
          </button>
        }
      >
        {loadingMembers ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay miembros en este rol</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium">
                    {member.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {member.user?.name || 'Usuario desconocido'}
                      </p>
                      {member.clientName && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {member.clientName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {member.user?.email || member.externalId || member.userId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.userId)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Remover miembro"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

export default CapudataRoleDetail;
