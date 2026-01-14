'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  CondominiumList,
  CondominiumForm,
  CondominiumDetail,
  ManagerAssignment,
  type Condominium,
  type PaginationInfo,
  type CondominiumFormData,
  type CondominiumManagerInfo,
} from '@/components/organisms';
import { ConfirmDialog } from '@/components/molecules';

type ViewMode = 'list' | 'view' | 'create' | 'edit';

interface CondominiumsManagerProps {
  initialCondominiums?: Condominium[];
  initialPagination?: PaginationInfo;
}

export function CondominiumsManager({
  initialCondominiums = [],
  initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 },
}: CondominiumsManagerProps) {
  // State
  const [condominiums, setCondominiums] = useState<Condominium[]>(initialCondominiums);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCondominium, setSelectedCondominium] = useState<Condominium | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [condominiumToDelete, setCondominiumToDelete] = useState<Condominium | null>(null);

  // Manager assignment modal state
  const [managerModalOpen, setManagerModalOpen] = useState(false);

  // Managers state
  const [managers, setManagers] = useState<CondominiumManagerInfo[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Fetch condominiums
  const fetchCondominiums = useCallback(
    async (page: number = 1, search: string = '') => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '10');
        if (search) {
          params.set('search', search);
        }

        const response = await fetch(`/api/admin/condominiums?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Error al cargar condominios');
        }

        const data = await response.json();

        // Handle paginated response from API
        // API returns { data: [...], pagination: { page, limit, total, totalPages } }
        if (data.data && data.pagination) {
          setCondominiums(data.data);
          setPagination({
            page: data.pagination.page || page,
            limit: data.pagination.limit || 10,
            total: data.pagination.total || 0,
            totalPages: data.pagination.totalPages || Math.ceil((data.pagination.total || 0) / 10),
          });
        } else if (data.items) {
          // Alternative format with items
          setCondominiums(data.items);
          setPagination({
            page: data.page || page,
            limit: data.limit || 10,
            total: data.total || 0,
            totalPages: data.totalPages || Math.ceil((data.total || 0) / 10),
          });
        } else if (Array.isArray(data)) {
          // Handle non-paginated response
          setCondominiums(data);
          setPagination({
            page: 1,
            limit: data.length || 10,
            total: data.length,
            totalPages: 1,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchCondominiums(1, '');
  }, [fetchCondominiums]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // Handlers
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchCondominiums(1, query);
    },
    [fetchCondominiums]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchCondominiums(page, searchQuery);
    },
    [fetchCondominiums, searchQuery]
  );

  const handleCreate = useCallback(() => {
    setSelectedCondominium(null);
    setViewMode('create');
    setError(null);
  }, []);

  // Fetch single condominium by ID
  const fetchCondominiumById = useCallback(async (id: string): Promise<Condominium | null> => {
    try {
      const response = await fetch(`/api/admin/condominiums/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar condominio');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  // Fetch managers for a condominium
  const fetchManagers = useCallback(async (condominiumId: string) => {
    setLoadingManagers(true);
    try {
      const response = await fetch(`/api/admin/condominiums/${condominiumId}/managers`);
      if (!response.ok) {
        throw new Error('Error al cargar administradores');
      }
      const data = await response.json();
      setManagers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  }, []);

  const handleView = useCallback(
    async (condominium: Condominium) => {
      setLoading(true);
      setError(null);

      // Fetch fresh data from API
      const freshData = await fetchCondominiumById(condominium.id);
      if (freshData) {
        setSelectedCondominium(freshData);
        setViewMode('view');
        // Fetch managers for this condominium
        fetchManagers(freshData.id);
      }
      setLoading(false);
    },
    [fetchCondominiumById, fetchManagers]
  );

  const handleEdit = useCallback(
    async (condominium: Condominium) => {
      setLoading(true);
      setError(null);

      // Fetch fresh data from API
      const freshData = await fetchCondominiumById(condominium.id);
      if (freshData) {
        setSelectedCondominium(freshData);
        setViewMode('edit');
      }
      setLoading(false);
    },
    [fetchCondominiumById]
  );

  const handleDelete = useCallback((condominium: Condominium) => {
    setCondominiumToDelete(condominium);
    setDeleteDialogOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedCondominium(null);
    setManagers([]);
    setError(null);
  }, []);

  // Remove manager from condominium
  const handleRemoveManager = useCallback(
    async (managerId: string) => {
      if (!selectedCondominium) return;

      try {
        const response = await fetch(
          `/api/admin/condominiums/${selectedCondominium.id}/managers/${managerId}`,
          { method: 'DELETE' }
        );

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar administrador');
        }

        setSuccessMessage('Administrador eliminado correctamente');
        // Refresh managers list
        fetchManagers(selectedCondominium.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    },
    [selectedCondominium, fetchManagers]
  );

  // Create condominium
  const handleCreateSubmit = useCallback(
    async (data: CondominiumFormData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/condominiums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear condominio');
        }

        setSuccessMessage('Condominio creado correctamente');
        setViewMode('list');
        fetchCondominiums(1, searchQuery);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [fetchCondominiums, searchQuery]
  );

  // Update condominium
  const handleEditSubmit = useCallback(
    async (data: CondominiumFormData) => {
      if (!selectedCondominium) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/condominiums/${selectedCondominium.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar condominio');
        }

        setSuccessMessage('Condominio actualizado correctamente');
        setViewMode('list');
        setSelectedCondominium(null);
        fetchCondominiums(pagination.page, searchQuery);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedCondominium, fetchCondominiums, pagination.page, searchQuery]
  );

  // Confirm delete (soft delete)
  const handleConfirmDelete = useCallback(async () => {
    if (!condominiumToDelete) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/condominiums/${condominiumToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar condominio');
      }

      setSuccessMessage('Condominio eliminado correctamente');
      setDeleteDialogOpen(false);
      setCondominiumToDelete(null);
      fetchCondominiums(pagination.page, searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [condominiumToDelete, fetchCondominiums, pagination.page, searchQuery]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setCondominiumToDelete(null);
  }, []);

  // Toggle condominium status
  const handleToggleStatus = useCallback(async () => {
    if (!selectedCondominium) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/condominiums/${selectedCondominium.id}/toggle`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      const updatedCondominium = await response.json();
      setSelectedCondominium(updatedCondominium);
      setSuccessMessage(
        `Condominio ${updatedCondominium.isActive ? 'activado' : 'desactivado'} correctamente`
      );

      // Update the list
      setCondominiums((prev) =>
        prev.map((c) => (c.id === updatedCondominium.id ? updatedCondominium : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedCondominium]);

  // Convert condominium to form data
  const getFormData = (condominium: Condominium): CondominiumFormData => ({
    name: condominium.name,
    nit: condominium.nit,
    address: condominium.address,
    city: condominium.city,
    phone: condominium.phone,
    email: condominium.email,
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
        <CondominiumList
          condominiums={condominiums}
          pagination={pagination}
          searchQuery={searchQuery}
          loading={loading}
          selectedId={selectedCondominium?.id}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'view' && selectedCondominium && (
        <CondominiumDetail
          condominium={selectedCondominium}
          managers={managers}
          loadingManagers={loadingManagers}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onBack={handleBackToList}
          onManageManagers={() => setManagerModalOpen(true)}
          onRemoveManager={handleRemoveManager}
        />
      )}

      {viewMode === 'create' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Crear Condominio</h2>
            <p className="text-sm text-gray-500">Ingrese los datos del nuevo condominio</p>
          </div>
          <div className="p-4">
            <CondominiumForm
              onSubmit={handleCreateSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {viewMode === 'edit' && selectedCondominium && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Editar Condominio</h2>
            <p className="text-sm text-gray-500">{selectedCondominium.name}</p>
          </div>
          <div className="p-4">
            <CondominiumForm
              initialData={getFormData(selectedCondominium)}
              isEditMode
              onSubmit={handleEditSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Manager Assignment Modal */}
      {managerModalOpen && selectedCondominium && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setManagerModalOpen(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Administradores del Condominio
                  </h3>
                  <p className="text-sm text-gray-500">{selectedCondominium.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setManagerModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto p-4">
                <ManagerAssignment
                  condominium={{
                    id: selectedCondominium.id,
                    name: selectedCondominium.name,
                    nit: selectedCondominium.nit,
                    isActive: selectedCondominium.isActive,
                  }}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-gray-200 p-4">
                <button
                  type="button"
                  onClick={() => {
                    setManagerModalOpen(false);
                    // Refresh managers list after closing modal
                    if (selectedCondominium) {
                      fetchManagers(selectedCondominium.id);
                    }
                  }}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Eliminar Condominio"
        message={`¿Esta seguro de eliminar el condominio "${condominiumToDelete?.name}"? Esta accion marcara el condominio como inactivo.`}
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

export default CondominiumsManager;
