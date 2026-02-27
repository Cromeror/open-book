'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  UserList,
  UserForm,
  UserDetail,
  type User,
  type UserPaginationInfo,
  type UserFormData,
} from '@/components/organisms';
import { ConfirmDialog } from '@/components/molecules';

type ViewMode = 'list' | 'view' | 'create' | 'edit';

export function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UserPaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async (page: number = 1, search: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar usuarios');

      const data = await response.json();

      if (data.data && data.pagination) {
        setUsers(data.data);
        setPagination({
          page: data.pagination.page || page,
          limit: data.pagination.limit || 10,
          total: data.pagination.total || 0,
          totalPages: data.pagination.totalPages || Math.ceil((data.pagination.total || 0) / 10),
        });
      } else if (data.items) {
        setUsers(data.items);
        setPagination({
          page: data.page || page,
          limit: data.limit || 10,
          total: data.total || 0,
          totalPages: data.totalPages || Math.ceil((data.total || 0) / 10),
        });
      } else if (Array.isArray(data)) {
        setUsers(data);
        setPagination({ page: 1, limit: data.length || 10, total: data.length, totalPages: 1 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, '');
  }, [fetchUsers]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  const fetchUserById = useCallback(async (id: string): Promise<User | null> => {
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) throw new Error('Error al cargar usuario');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchUsers(1, query);
    },
    [fetchUsers]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchUsers(page, searchQuery);
    },
    [fetchUsers, searchQuery]
  );

  const handleCreate = useCallback(() => {
    setSelectedUser(null);
    setViewMode('create');
    setError(null);
  }, []);

  const handleView = useCallback(
    async (user: User) => {
      setLoading(true);
      setError(null);
      const freshData = await fetchUserById(user.id);
      if (freshData) {
        setSelectedUser(freshData);
        setViewMode('view');
      }
      setLoading(false);
    },
    [fetchUserById]
  );

  const handleEdit = useCallback(
    async (user: User) => {
      setLoading(true);
      setError(null);
      const freshData = await fetchUserById(user.id);
      if (freshData) {
        setSelectedUser(freshData);
        setViewMode('edit');
      }
      setLoading(false);
    },
    [fetchUserById]
  );

  const handleDelete = useCallback((user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedUser(null);
    setError(null);
  }, []);

  // Create user
  const handleCreateSubmit = useCallback(
    async (data: UserFormData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear usuario');
        }

        setSuccessMessage('Usuario creado correctamente');
        setViewMode('list');
        fetchUsers(1, searchQuery);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers, searchQuery]
  );

  // Update user
  const handleEditSubmit = useCallback(
    async (data: UserFormData) => {
      if (!selectedUser) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar usuario');
        }

        setSuccessMessage('Usuario actualizado correctamente');
        setViewMode('list');
        setSelectedUser(null);
        fetchUsers(pagination.page, searchQuery);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedUser, fetchUsers, pagination.page, searchQuery]
  );

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar usuario');
      }

      setSuccessMessage('Usuario eliminado correctamente');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(pagination.page, searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userToDelete, fetchUsers, pagination.page, searchQuery]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  const getEditFormData = (user: User): Partial<UserFormData> => ({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    isSuperAdmin: user.isSuperAdmin,
    isActive: user.isActive,
  });

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-600">Administracion de usuarios del sistema</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{successMessage}</div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <UserList
          users={users}
          pagination={pagination}
          searchQuery={searchQuery}
          loading={loading}
          selectedId={selectedUser?.id}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'view' && selectedUser && (
        <UserDetail
          user={selectedUser}
          loading={loading}
          onEdit={handleEdit}
          onBack={handleBackToList}
        />
      )}

      {viewMode === 'create' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Crear Usuario</h2>
            <p className="text-sm text-gray-500">Ingrese los datos del nuevo usuario</p>
          </div>
          <div className="p-4">
            <UserForm
              onSubmit={handleCreateSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {viewMode === 'edit' && selectedUser && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Editar Usuario</h2>
            <p className="text-sm text-gray-500">
              {selectedUser.firstName} {selectedUser.lastName}
            </p>
          </div>
          <div className="p-4">
            <UserForm
              initialData={getEditFormData(selectedUser)}
              isEditMode
              onSubmit={handleEditSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Eliminar Usuario"
        message={`¿Esta seguro de eliminar al usuario "${userToDelete?.firstName} ${userToDelete?.lastName}"? Esta accion no se puede deshacer.`}
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

export default UsersManager;
