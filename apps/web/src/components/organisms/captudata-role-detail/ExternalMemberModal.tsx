'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal } from '@/components/atoms';
import type { Organization, ExternalUser } from '@/types/business/organization.types';

export interface ExternalMemberSelection {
  organizationCode: string;
  externalUserId: string;
  externalUserLabel: string;
  externalUserEmail?: string;
}

export interface ExternalMemberModalProps {
  isOpen: boolean;
  roleName?: string;
  loading?: boolean;
  /** IDs of users already in the pool (to mark as "already member") */
  existingMemberExternalIds?: string[];
  onConfirm: (selection: ExternalMemberSelection) => void;
  onCancel: () => void;
}

function getUserLabel(user: ExternalUser): string {
  if (user.name) return user.name;
  if (user.first_name || user.last_name) {
    return [user.first_name, user.last_name].filter(Boolean).join(' ');
  }
  return user.email || String(user.id);
}

function getUserDescription(user: ExternalUser): string {
  const label = getUserLabel(user);
  if (user.email && label !== user.email) return user.email;
  return `ID: ${user.id}`;
}

export function ExternalMemberModal({
  isOpen,
  roleName,
  loading = false,
  existingMemberExternalIds = [],
  onConfirm,
  onCancel,
}: ExternalMemberModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgCode, setSelectedOrgCode] = useState('');
  const [externalUsers, setExternalUsers] = useState<ExternalUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOrgCode('');
      setSelectedUserId('');
      setUserSearch('');
      setExternalUsers([]);
      setError(null);
      setOrgError(null);
    }
  }, [isOpen]);

  // Fetch organizations when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchOrgs = async () => {
      setLoadingOrgs(true);
      try {
        const response = await fetch('/api/admin/organizations?isActive=true&limit=100');
        if (!response.ok) throw new Error('Error al cargar organizaciones');
        const result = await response.json();
        setOrganizations(result.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrgs();
  }, [isOpen]);

  // Fetch external users when organization changes
  useEffect(() => {
    if (!selectedOrgCode) {
      setExternalUsers([]);
      setSelectedUserId('');
      setOrgError(null);
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      setOrgError(null);
      setSelectedUserId('');
      setUserSearch('');

      try {
        const response = await fetch(`/api/admin/organizations/${selectedOrgCode}/external-users`);
        if (!response.ok) throw new Error('Error al cargar usuarios externos');
        const result = await response.json();

        if (result.error) {
          setOrgError(result.error);
          setExternalUsers([]);
        } else {
          setExternalUsers(result.users ?? []);
        }
      } catch (err) {
        setOrgError(err instanceof Error ? err.message : 'Error desconocido');
        setExternalUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [selectedOrgCode]);

  const existingSet = useMemo(
    () => new Set(existingMemberExternalIds.map(String)),
    [existingMemberExternalIds],
  );

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return externalUsers;
    const term = userSearch.toLowerCase();
    return externalUsers.filter((user) => {
      const label = getUserLabel(user).toLowerCase();
      const email = (user.email ?? '').toLowerCase();
      const id = String(user.id);
      return label.includes(term) || email.includes(term) || id.includes(term);
    });
  }, [externalUsers, userSearch]);

  const handleConfirm = useCallback(() => {
    if (!selectedOrgCode || !selectedUserId) return;

    const user = externalUsers.find((u) => String(u.id) === selectedUserId);
    onConfirm({
      organizationCode: selectedOrgCode,
      externalUserId: selectedUserId,
      externalUserLabel: user ? getUserLabel(user) : selectedUserId,
      externalUserEmail: user?.email || undefined,
    });
  }, [selectedOrgCode, selectedUserId, externalUsers, onConfirm]);

  const isLoading = loading || loadingOrgs || loadingUsers;

  const footer = (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedUserId || isLoading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Agregando...' : 'Agregar'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Agregar Miembro Externo"
      subtitle={roleName}
      size="2xl"
      preventClose={loading}
      footer={footer}
    >
      <div className="space-y-4">
        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organizacion
          </label>
          <select
            value={selectedOrgCode}
            onChange={(e) => setSelectedOrgCode(e.target.value)}
            disabled={loadingOrgs || loading}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loadingOrgs ? 'Cargando organizaciones...' : 'Seleccione una organizacion...'}
            </option>
            {organizations.map((org) => (
              <option key={org.code} value={org.code}>
                {org.name}
              </option>
            ))}
          </select>
          {orgError && (
            <p className="mt-1.5 text-sm text-amber-600">
              {orgError}
            </p>
          )}
        </div>

        {/* Step 2: External User */}
        {selectedOrgCode && !orgError && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando usuarios...
              </div>
            ) : externalUsers.length === 0 ? (
              <p className="py-2 text-sm text-gray-500">
                No se encontraron usuarios para esta organizacion
              </p>
            ) : (
              <>
                {/* Search filter */}
                <div className="relative mb-2">
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={`Buscar entre ${externalUsers.length} usuarios...`}
                    disabled={loading}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* User list */}
                <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200">
                  {filteredUsers.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      No se encontraron usuarios con &quot;{userSearch}&quot;
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => {
                        const userId = String(user.id);
                        const isSelected = selectedUserId === userId;
                        const isMember = existingSet.has(userId);

                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => !isMember && setSelectedUserId(isSelected ? '' : userId)}
                            disabled={loading || isMember}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                              isMember
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-blue-50 text-blue-900'
                                  : 'hover:bg-gray-50 text-gray-900'
                            }`}
                          >
                            {/* Avatar */}
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                                isMember
                                  ? 'bg-gray-200 text-gray-400'
                                  : isSelected
                                    ? 'bg-blue-200 text-blue-700'
                                    : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {getUserLabel(user).charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{getUserLabel(user)}</p>
                              <p className="truncate text-xs text-gray-500">{getUserDescription(user)}</p>
                            </div>

                            {/* Status badges */}
                            {isMember && (
                              <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                                Miembro
                              </span>
                            )}
                            {isSelected && !isMember && (
                              <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Count */}
                <p className="mt-1 text-xs text-gray-400">
                  {filteredUsers.length} de {externalUsers.length} usuarios
                  {selectedUserId && !existingSet.has(selectedUserId) && (
                    <> &middot; 1 seleccionado</>
                  )}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ExternalMemberModal;
