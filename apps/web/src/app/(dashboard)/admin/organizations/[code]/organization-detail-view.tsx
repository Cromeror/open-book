'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil, Users, KeyRound, AlertCircle } from 'lucide-react';
import { SearchInput } from '@/components/molecules/SearchInput';
import type { Organization, ExternalUser } from '@/types/business/organization.types';

interface Props {
  organization: Organization;
  externalUsers?: ExternalUser[];
  externalUsersError?: string;
}

function getUserDisplayName(user: ExternalUser): string {
  return user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || '';
}

export function OrganizationDetailView({
  organization,
  externalUsers = [],
  externalUsersError,
}: Props) {
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return externalUsers;
    const term = userSearch.toLowerCase();
    return externalUsers.filter((user) => {
      const name = getUserDisplayName(user).toLowerCase();
      const email = (user.email ?? '').toLowerCase();
      const role = (user.role ?? '').toLowerCase();
      const id = String(user.id ?? '').toLowerCase();
      return name.includes(term) || email.includes(term) || role.includes(term) || id.includes(term);
    });
  }, [externalUsers, userSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{organization.name}</h1>
          <code className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-sm font-mono text-gray-700">
            {organization.code}
          </code>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              organization.isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {organization.isActive ? 'Activa' : 'Inactiva'}
          </span>
          <Link
            href={`/admin/organizations/${organization.code}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        </div>
      </div>

      {organization.description && (
        <p className="text-sm text-gray-600">{organization.description}</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Vinculacion Externa
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">Identificador Externo</dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {organization.externalId ? (
                  <code className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-mono text-amber-700">
                    {organization.externalId}
                  </code>
                ) : (
                  <span className="text-gray-400 italic">No definido</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Integracion</dt>
              <dd className="mt-0.5">
                {organization.integration ? (
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {organization.integration.name}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm italic">Sin integracion (local)</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Credenciales</dt>
              <dd className="mt-0.5">
                {organization.hasCredentials ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <KeyRound className="h-3 w-3" />
                    Configuradas
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm italic">No configuradas</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Metadata
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">Creado</dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {new Date(organization.createdAt).toLocaleString('es-CO')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Actualizado</dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {new Date(organization.updatedAt).toLocaleString('es-CO')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* External Users Section */}
      {organization.hasCredentials && organization.integration && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Usuarios de {organization.name}
              </h3>
              <span className="ml-auto text-xs text-gray-500">
                {filteredUsers.length === externalUsers.length
                  ? `${externalUsers.length} usuario${externalUsers.length !== 1 ? 's' : ''}`
                  : `${filteredUsers.length} de ${externalUsers.length} usuario${externalUsers.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            {externalUsers.length > 0 && (
              <SearchInput
                placeholder="Filtrar por nombre, email, rol o ID..."
                onSearch={setUserSearch}
                size="sm"
              />
            )}
          </div>

          {externalUsersError && (
            <div className="m-4 rounded-md bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{externalUsersError}</p>
            </div>
          )}

          {externalUsers.length === 0 && !externalUsersError ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No se encontraron usuarios
            </div>
          ) : filteredUsers.length === 0 && userSearch ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No se encontraron usuarios que coincidan con &ldquo;{userSearch}&rdquo;
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id ?? user.email} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                          {user.id}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getUserDisplayName(user) || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.role ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {user.role}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
