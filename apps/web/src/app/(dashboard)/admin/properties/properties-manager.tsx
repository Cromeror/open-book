'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PropertyList,
  PropertyForm,
  PropertyDetail,
  type Property,
  type PropertyPaginationInfo,
  type PropertyFormData,
  type PropertyResident,
  PropertyType,
} from '@/components/organisms';
import {
  ConfirmDialog,
  Section,
  ResidentAssignmentModal,
  RelationTypeLabels,
  type ResidentAssignmentData,
  type UserOption,
} from '@/components/molecules';

type ViewMode = 'list' | 'view' | 'create' | 'edit';

interface PropertiesManagerProps {
  /** Condominium ID to filter properties */
  condominiumId: string;
  /** Condominium name for display */
  condominiumName?: string;
  initialProperties?: Property[];
  initialPagination?: PropertyPaginationInfo;
}

export function PropertiesManager({
  condominiumId,
  condominiumName = 'Condominio',
  initialProperties = [],
  initialPagination = { page: 1, limit: 20, total: 0, totalPages: 0 },
}: PropertiesManagerProps) {
  // State
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [pagination, setPagination] = useState<PropertyPaginationInfo>(initialPagination);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Residents state
  const [residents, setResidents] = useState<PropertyResident[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [addResidentModalOpen, setAddResidentModalOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Remove resident dialog state
  const [removeResidentDialogOpen, setRemoveResidentDialogOpen] = useState(false);
  const [residentToRemove, setResidentToRemove] = useState<string | null>(null);

  // Fetch properties
  const fetchProperties = useCallback(
    async (page: number = 1, search: string = '', type: PropertyType | '' = '') => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('condominiumId', condominiumId);
        params.set('page', page.toString());
        params.set('limit', '20');
        if (search) {
          params.set('search', search);
        }
        if (type) {
          params.set('type', type);
        }

        const response = await fetch(`/api/admin/properties?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Error al cargar propiedades');
        }

        const data = await response.json();

        if (data.data && data.pagination) {
          setProperties(data.data);
          setPagination({
            page: data.pagination.page || page,
            limit: data.pagination.limit || 20,
            total: data.pagination.total || 0,
            totalPages: data.pagination.totalPages || Math.ceil((data.pagination.total || 0) / 20),
          });
        } else if (Array.isArray(data)) {
          setProperties(data);
          setPagination({
            page: 1,
            limit: data.length || 20,
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
    [condominiumId]
  );

  // Initial fetch
  useEffect(() => {
    fetchProperties(1, '', '');
  }, [fetchProperties]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // Fetch residents for a property
  const fetchResidents = useCallback(async (propertyId: string) => {
    try {
      const response = await fetch(`/api/admin/property-residents/property/${propertyId}`);
      if (!response.ok) {
        throw new Error('Error al cargar residentes');
      }
      const data = await response.json();
      setResidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching residents:', err);
      setResidents([]);
    }
  }, []);

  // Fetch available users for assignment
  const fetchAvailableUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users?isActive=true&limit=100');
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      const data = await response.json();
      const users = data.data || data || [];
      setAvailableUsers(
        users.map((user: { id: string; email: string; firstName: string; lastName: string }) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }))
      );
    } catch (err) {
      console.error('Error fetching users:', err);
      setAvailableUsers([]);
    }
  }, []);

  // Handlers
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchProperties(1, query, typeFilter);
    },
    [fetchProperties, typeFilter]
  );

  const handleTypeFilter = useCallback(
    (type: PropertyType | '') => {
      setTypeFilter(type);
      fetchProperties(1, searchQuery, type);
    },
    [fetchProperties, searchQuery]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchProperties(page, searchQuery, typeFilter);
    },
    [fetchProperties, searchQuery, typeFilter]
  );

  const handleCreate = useCallback(() => {
    setSelectedProperty(null);
    setViewMode('create');
    setError(null);
  }, []);

  // Fetch single property by ID
  const fetchPropertyById = useCallback(async (id: string): Promise<Property | null> => {
    try {
      const response = await fetch(`/api/admin/properties/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar propiedad');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const handleView = useCallback(
    async (property: Property) => {
      setLoading(true);
      setError(null);

      const freshData = await fetchPropertyById(property.id);
      if (freshData) {
        setSelectedProperty(freshData);
        setViewMode('view');
        // Fetch residents when viewing property
        await fetchResidents(property.id);
      }
      setLoading(false);
    },
    [fetchPropertyById, fetchResidents]
  );

  const handleEdit = useCallback(
    async (property: Property) => {
      setLoading(true);
      setError(null);

      const freshData = await fetchPropertyById(property.id);
      if (freshData) {
        setSelectedProperty(freshData);
        setViewMode('edit');
        await fetchResidents(freshData.id);
      }
      setLoading(false);
    },
    [fetchPropertyById, fetchResidents]
  );

  const handleDelete = useCallback((property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedProperty(null);
    setResidents([]);
    setError(null);
  }, []);

  // Create property
  const handleCreateSubmit = useCallback(
    async (data: PropertyFormData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear propiedad');
        }

        setSuccessMessage('Propiedad creada correctamente');
        setViewMode('list');
        fetchProperties(1, searchQuery, typeFilter);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [fetchProperties, searchQuery, typeFilter]
  );

  // Update property
  const handleEditSubmit = useCallback(
    async (data: PropertyFormData) => {
      if (!selectedProperty) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/properties/${selectedProperty.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar propiedad');
        }

        setSuccessMessage('Propiedad actualizada correctamente');
        setViewMode('list');
        setSelectedProperty(null);
        fetchProperties(pagination.page, searchQuery, typeFilter);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedProperty, fetchProperties, pagination.page, searchQuery, typeFilter]
  );

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!propertyToDelete) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/properties/${propertyToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar propiedad');
      }

      setSuccessMessage('Propiedad eliminada correctamente');
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      fetchProperties(pagination.page, searchQuery, typeFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [propertyToDelete, fetchProperties, pagination.page, searchQuery, typeFilter]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  }, []);

  // Toggle property status
  const handleToggleStatus = useCallback(async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/properties/${selectedProperty.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !selectedProperty.isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      const updatedProperty = await response.json();
      setSelectedProperty(updatedProperty);
      setSuccessMessage(
        `Propiedad ${updatedProperty.isActive ? 'activada' : 'desactivada'} correctamente`
      );

      setProperties((prev) =>
        prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedProperty]);

  // Resident handlers
  const handleAddResident = useCallback(async () => {
    await fetchAvailableUsers();
    setAddResidentModalOpen(true);
  }, [fetchAvailableUsers]);

  const handleAddResidentConfirm = useCallback(
    async (data: ResidentAssignmentData) => {
      if (!selectedProperty) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/property-residents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: selectedProperty.id,
            userId: data.userId,
            relationType: data.relationType,
            isPrimary: data.isPrimary,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al asignar residente');
        }

        setSuccessMessage('Residente asignado correctamente');
        setAddResidentModalOpen(false);
        await fetchResidents(selectedProperty.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedProperty, fetchResidents]
  );

  const handleRemoveResident = useCallback((residentId: string) => {
    setResidentToRemove(residentId);
    setRemoveResidentDialogOpen(true);
  }, []);

  const handleConfirmRemoveResident = useCallback(async () => {
    if (!residentToRemove || !selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/property-residents/${residentToRemove}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar residente');
      }

      setSuccessMessage('Residente eliminado correctamente');
      setRemoveResidentDialogOpen(false);
      setResidentToRemove(null);
      await fetchResidents(selectedProperty.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [residentToRemove, selectedProperty, fetchResidents]);

  const handleCancelRemoveResident = useCallback(() => {
    setRemoveResidentDialogOpen(false);
    setResidentToRemove(null);
  }, []);

  const handleSetPrimaryResident = useCallback(
    async (residentId: string) => {
      if (!selectedProperty) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/property-residents/property/${selectedProperty.id}/primary`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ residentId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al establecer contacto principal');
        }

        setSuccessMessage('Contacto principal actualizado');
        await fetchResidents(selectedProperty.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [selectedProperty, fetchResidents]
  );

  // Convert property to form data
  const getFormData = (property: Property): PropertyFormData => ({
    identifier: property.identifier,
    type: property.type,
    description: property.description,
    floor: property.floor,
    area: property.area,
    condominiumId: property.condominiumId,
    groupId: property.groupId,
    displayOrder: property.displayOrder,
  });

  return (
    <div className="space-y-6">
      {/* Header with condominium name */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-sm text-gray-500">{condominiumName}</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <PropertyList
          properties={properties}
          pagination={pagination}
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          loading={loading}
          selectedId={selectedProperty?.id}
          onSearch={handleSearch}
          onTypeFilter={handleTypeFilter}
          onPageChange={handlePageChange}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'view' && selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          residents={residents}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onBack={handleBackToList}
          onAddResident={handleAddResident}
          onRemoveResident={handleRemoveResident}
          onSetPrimaryResident={handleSetPrimaryResident}
        />
      )}

      {viewMode === 'create' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Crear Propiedad</h2>
            <p className="text-sm text-gray-500">Ingrese los datos de la nueva propiedad</p>
          </div>
          <div className="p-4">
            <PropertyForm
              condominiumId={condominiumId}
              onSubmit={handleCreateSubmit}
              onCancel={handleBackToList}
              loading={loading}
            />
          </div>
        </div>
      )}

      {viewMode === 'edit' && selectedProperty && (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white shadow">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Editar Propiedad</h2>
              <p className="text-sm text-gray-500">{selectedProperty.identifier}</p>
            </div>
            <div className="p-4">
              <PropertyForm
                initialData={getFormData(selectedProperty)}
                isEditMode
                condominiumId={condominiumId}
                onSubmit={handleEditSubmit}
                onCancel={handleBackToList}
                loading={loading}
              />
            </div>
          </div>

          <Section
            title="Propietarios y Residentes"
            customHeader={
              <button
                type="button"
                onClick={handleAddResident}
                disabled={loading}
                className="ml-auto rounded px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                + Agregar
              </button>
            }
          >
            {residents.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No hay propietarios o residentes asignados</p>
                <button
                  type="button"
                  onClick={handleAddResident}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Agregar el primer residente
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {residents.map((resident) => (
                  <div
                    key={resident.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {resident.user.firstName[0]}
                          {resident.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {resident.user.firstName} {resident.user.lastName}
                          </p>
                          {resident.isPrimary && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{resident.user.email}</span>
                          <span>-</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                              resident.relationType === 'OWNER'
                                ? 'bg-purple-100 text-purple-700'
                                : resident.relationType === 'TENANT'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {RelationTypeLabels[resident.relationType]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!resident.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryResident(resident.id)}
                          disabled={loading}
                          className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                          Hacer principal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveResident(resident.id)}
                        disabled={loading}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* Delete Property Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Eliminar Propiedad"
        message={`¿Esta seguro de eliminar la propiedad "${propertyToDelete?.identifier}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={loading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Remove Resident Confirmation Dialog */}
      <ConfirmDialog
        isOpen={removeResidentDialogOpen}
        title="Eliminar Residente"
        message="¿Esta seguro de eliminar este residente de la propiedad?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={loading}
        onConfirm={handleConfirmRemoveResident}
        onCancel={handleCancelRemoveResident}
      />

      {/* Add Resident Modal */}
      <ResidentAssignmentModal
        isOpen={addResidentModalOpen}
        title="Asignar Residente"
        subtitle={selectedProperty?.identifier}
        users={availableUsers}
        loading={loading}
        onConfirm={handleAddResidentConfirm}
        onCancel={() => setAddResidentModalOpen(false)}
      />
    </div>
  );
}

export default PropertiesManager;
