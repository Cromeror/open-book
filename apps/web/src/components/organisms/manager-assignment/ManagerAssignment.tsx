'use client';

import { useState, useCallback, useEffect } from 'react';
import { useModuleRegistry } from '@/lib/module-registry.context';
import { SearchInput } from '@/components/molecules';
import type {
  ManagerAssignmentProps,
  UserInfo,
  CondominiumInfo,
  ManagerAssignmentRecord,
  UserSearchResult,
  CondominiumSearchResult,
} from './types';

/**
 * ManagerAssignment - Organism for assigning managers to condominiums
 *
 * Behavior:
 * - If only condominium is provided: shows user search
 * - If only user is provided: shows condominium search
 * - If both are provided: proceeds with assignment
 * - If user is not SuperAdmin: shows unauthorized message
 */
export function ManagerAssignment({
  condominium,
  user,
  onAssignmentSuccess,
  onAssignmentError,
  externalLoading = false,
}: ManagerAssignmentProps) {
  const { isSuperAdmin } = useModuleRegistry();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [condominiumSearchQuery, setCondominiumSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<UserInfo[]>([]);
  const [condominiumResults, setCondominiumResults] = useState<CondominiumInfo[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchingCondominiums, setSearchingCondominiums] = useState(false);

  // Selection states
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(user ?? null);
  const [selectedCondominium, setSelectedCondominium] = useState<CondominiumInfo | null>(
    condominium ?? null
  );
  const [isPrimary, setIsPrimary] = useState(false);

  // Current managers list (for showing existing assignments)
  const [existingManagers, setExistingManagers] = useState<ManagerAssignmentRecord[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // If not SuperAdmin, don't render functionality
  if (!isSuperAdmin) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="font-medium text-amber-800">Acceso restringido</p>
            <p className="text-sm text-amber-700">
              Solo los SuperAdministradores pueden asignar gerentes a condominios.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch existing managers when condominium is selected
  useEffect(() => {
    if (selectedCondominium) {
      fetchExistingManagers(selectedCondominium.id);
    } else {
      setExistingManagers([]);
    }
  }, [selectedCondominium?.id]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // Fetch existing managers for a condominium
  const fetchExistingManagers = useCallback(async (condominiumId: string) => {
    setLoadingManagers(true);
    try {
      const response = await fetch(`/api/admin/condominiums/${condominiumId}/managers`);
      if (!response.ok) {
        throw new Error('Error al cargar gerentes');
      }
      const data: ManagerAssignmentRecord[] = await response.json();
      setExistingManagers(data);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setExistingManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setUserResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const params = new URLSearchParams({ search: query, limit: '10' });
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al buscar usuarios');
      }
      const data: UserSearchResult = await response.json();
      setUserResults(data.data || []);
    } catch (err) {
      console.error('Error searching users:', err);
      setUserResults([]);
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  // Search condominiums
  const searchCondominiums = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setCondominiumResults([]);
      return;
    }

    setSearchingCondominiums(true);
    try {
      const params = new URLSearchParams({ search: query, limit: '10' });
      const response = await fetch(`/api/admin/condominiums?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al buscar condominios');
      }
      const data: CondominiumSearchResult = await response.json();
      setCondominiumResults(data.data || []);
    } catch (err) {
      console.error('Error searching condominiums:', err);
      setCondominiumResults([]);
    } finally {
      setSearchingCondominiums(false);
    }
  }, []);

  // Handle user search
  const handleUserSearch = useCallback(
    (query: string) => {
      setUserSearchQuery(query);
      searchUsers(query);
    },
    [searchUsers]
  );

  // Handle condominium search
  const handleCondominiumSearch = useCallback(
    (query: string) => {
      setCondominiumSearchQuery(query);
      searchCondominiums(query);
    },
    [searchCondominiums]
  );

  // Select user from results
  const handleSelectUser = useCallback((userItem: UserInfo) => {
    setSelectedUser(userItem);
    setUserResults([]);
    setUserSearchQuery('');
  }, []);

  // Select condominium from results
  const handleSelectCondominium = useCallback((condominiumItem: CondominiumInfo) => {
    setSelectedCondominium(condominiumItem);
    setCondominiumResults([]);
    setCondominiumSearchQuery('');
  }, []);

  // Clear user selection
  const handleClearUser = useCallback(() => {
    // Only allow clearing if user prop was not provided
    if (!user) {
      setSelectedUser(null);
    }
  }, [user]);

  // Clear condominium selection
  const handleClearCondominium = useCallback(() => {
    // Only allow clearing if condominium prop was not provided
    if (!condominium) {
      setSelectedCondominium(null);
    }
  }, [condominium]);

  // Check if user is already assigned
  const isUserAlreadyAssigned = useCallback(
    (userId: string): boolean => {
      return existingManagers.some((m) => m.userId === userId && m.isActive);
    },
    [existingManagers]
  );

  // Assign manager
  const handleAssign = useCallback(async () => {
    if (!selectedUser || !selectedCondominium) {
      setError('Debe seleccionar un usuario y un condominio');
      return;
    }

    if (isUserAlreadyAssigned(selectedUser.id)) {
      setError('Este usuario ya esta asignado como gerente de este condominio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/condominiums/${selectedCondominium.id}/managers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedUser.id,
            isPrimary,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al asignar gerente');
      }

      const assignment: ManagerAssignmentRecord = await response.json();

      setSuccessMessage(
        `${selectedUser.firstName} ${selectedUser.lastName} asignado como gerente`
      );

      // Refresh managers list
      await fetchExistingManagers(selectedCondominium.id);

      // Clear selection if not fixed by props
      if (!user) {
        setSelectedUser(null);
      }
      setIsPrimary(false);

      onAssignmentSuccess?.(assignment);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      onAssignmentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    selectedUser,
    selectedCondominium,
    isPrimary,
    isUserAlreadyAssigned,
    fetchExistingManagers,
    user,
    onAssignmentSuccess,
    onAssignmentError,
  ]);

  // Unassign manager
  const handleUnassign = useCallback(
    async (managerId: string) => {
      if (!selectedCondominium) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/condominiums/${selectedCondominium.id}/managers/${managerId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al desasignar gerente');
        }

        setSuccessMessage('Gerente desasignado correctamente');

        // Refresh managers list
        await fetchExistingManagers(selectedCondominium.id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [selectedCondominium, fetchExistingManagers]
  );

  // Toggle primary status
  const handleTogglePrimary = useCallback(
    async (managerId: string, currentIsPrimary: boolean) => {
      if (!selectedCondominium) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/condominiums/${selectedCondominium.id}/managers/${managerId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPrimary: !currentIsPrimary }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar gerente');
        }

        setSuccessMessage(
          !currentIsPrimary ? 'Gerente marcado como principal' : 'Gerente desmarcado como principal'
        );

        // Refresh managers list
        await fetchExistingManagers(selectedCondominium.id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [selectedCondominium, fetchExistingManagers]
  );

  const isLoading = loading || externalLoading;

  // Determine what to show based on props
  const showUserSearch = !user && !selectedUser;
  const showCondominiumSearch = !condominium && !selectedCondominium;
  const showAssignButton = selectedUser && selectedCondominium;

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Selected Condominium Display */}
      {selectedCondominium && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase">Condominio</p>
              <p className="text-sm font-medium text-blue-900">{selectedCondominium.name}</p>
              {selectedCondominium.nit && (
                <p className="text-xs text-blue-700">NIT: {selectedCondominium.nit}</p>
              )}
            </div>
            {!condominium && (
              <button
                type="button"
                onClick={handleClearCondominium}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Cambiar condominio"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Condominium Search */}
      {showCondominiumSearch && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Buscar condominio
          </label>
          <SearchInput
            placeholder="Buscar por nombre o NIT..."
            initialValue={condominiumSearchQuery}
            onSearch={handleCondominiumSearch}
            disabled={isLoading}
            size="sm"
          />
          {/* Results */}
          {searchingCondominiums && (
            <p className="text-xs text-gray-500">Buscando...</p>
          )}
          {condominiumResults.length > 0 && (
            <ul className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 max-h-48 overflow-auto">
              {condominiumResults.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectCondominium(item)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    {item.nit && <p className="text-xs text-gray-500">NIT: {item.nit}</p>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected User Display */}
      {selectedUser && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase">Usuario</p>
              <p className="text-sm font-medium text-green-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-xs text-green-700">{selectedUser.email}</p>
            </div>
            {!user && (
              <button
                type="button"
                onClick={handleClearUser}
                className="text-green-600 hover:text-green-800"
                aria-label="Cambiar usuario"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* User Search */}
      {showUserSearch && selectedCondominium && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Buscar usuario para asignar
          </label>
          <SearchInput
            placeholder="Buscar por nombre o correo..."
            initialValue={userSearchQuery}
            onSearch={handleUserSearch}
            disabled={isLoading}
            size="sm"
          />
          {/* Results */}
          {searchingUsers && <p className="text-xs text-gray-500">Buscando...</p>}
          {userResults.length > 0 && (
            <ul className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 max-h-48 overflow-auto">
              {userResults.map((item) => {
                const alreadyAssigned = isUserAlreadyAssigned(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => !alreadyAssigned && handleSelectUser(item)}
                      disabled={alreadyAssigned}
                      className={`w-full px-3 py-2 text-left transition-colors ${
                        alreadyAssigned
                          ? 'bg-gray-100 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{item.email}</p>
                        </div>
                        {alreadyAssigned && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                            Ya asignado
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Primary checkbox and Assign button */}
      {showAssignButton && (
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Marcar como gerente principal (contacto principal del condominio)
            </span>
          </label>

          <button
            type="button"
            onClick={handleAssign}
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Asignando...' : 'Asignar gerente'}
          </button>
        </div>
      )}

      {/* Existing Managers List */}
      {selectedCondominium && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Gerentes asignados
            {loadingManagers && (
              <span className="ml-2 text-xs text-gray-500">(cargando...)</span>
            )}
          </h4>

          {existingManagers.length === 0 && !loadingManagers ? (
            <p className="text-sm text-gray-500">No hay gerentes asignados</p>
          ) : (
            <ul className="space-y-2">
              {existingManagers
                .filter((m) => m.isActive)
                .map((manager) => (
                  <li
                    key={manager.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {manager.user?.firstName} {manager.user?.lastName}
                        </p>
                        {manager.isPrimary && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{manager.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePrimary(manager.id, manager.isPrimary)}
                        disabled={isLoading}
                        className="rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        title={
                          manager.isPrimary ? 'Quitar como principal' : 'Marcar como principal'
                        }
                      >
                        {manager.isPrimary ? 'Quitar principal' : 'Hacer principal'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnassign(manager.id)}
                        disabled={isLoading}
                        className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        Desasignar
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ManagerAssignment;
