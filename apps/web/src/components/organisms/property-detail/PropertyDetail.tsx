'use client';

import type { PropertyDetailProps, DetailFieldProps, ResidentRelationType } from './types';
import { PropertyTypeLabels, PropertyTypeIcons } from '../PropertyList';

const RelationTypeLabels: Record<ResidentRelationType, string> = {
  OWNER: 'Propietario',
  TENANT: 'Arrendatario',
  OTHER: 'Otro',
};

/**
 * DetailField - Renders a single field with label and value
 */
function DetailField({ label, value, fallback = '-' }: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-sm text-gray-900">{value ?? fallback}</p>
    </div>
  );
}

/**
 * PropertyDetail - Organism for displaying property details
 *
 * Displays all property information in a structured layout with action buttons.
 */
export function PropertyDetail({
  property,
  residents = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onBack,
  onAddResident,
  onRemoveResident,
  onSetPrimaryResident,
}: PropertyDetailProps) {
  return (
    <div className="space-y-6">
      {/* Property Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{PropertyTypeIcons[property.type]}</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{property.identifier}</h2>
              <p className="text-sm text-gray-500">
                {PropertyTypeLabels[property.type]} - Detalles de la propiedad
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(property)}
                disabled={loading}
                className="rounded px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                Editar
              </button>
            )}
            {onToggleStatus && (
              <button
                type="button"
                onClick={onToggleStatus}
                disabled={loading}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  property.isActive
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {property.isActive ? 'Desactivar' : 'Activar'}
              </button>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="rounded px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Volver
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Property Info */}
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Identificador" value={property.identifier} />
            <DetailField label="Tipo" value={PropertyTypeLabels[property.type]} />
            <DetailField label="Piso" value={property.floor} />
            <DetailField label="Area" value={property.area ? `${property.area} m²` : null} />

            {/* Description - full width */}
            {property.description && (
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Descripcion</p>
                <p className="mt-1 text-sm text-gray-900">{property.description}</p>
              </div>
            )}

            {/* Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Estado</p>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  property.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {property.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Created At */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Creado</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(property.createdAt).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Residents Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Propietarios y Residentes</h3>
            <p className="text-sm text-gray-500">
              {residents.length === 0
                ? 'No hay residentes asignados'
                : `${residents.length} residente${residents.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {onAddResident && (
            <button
              type="button"
              onClick={onAddResident}
              disabled={loading}
              className="rounded px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Agregar
            </button>
          )}
        </div>

        <div className="p-4">
          {residents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="mt-2 text-sm">No hay propietarios o residentes asignados</p>
              {onAddResident && (
                <button
                  type="button"
                  onClick={onAddResident}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Agregar el primer residente
                </button>
              )}
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
                    {!resident.isPrimary && onSetPrimaryResident && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryResident(resident.id)}
                        disabled={loading}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        title="Establecer como principal"
                      >
                        Hacer principal
                      </button>
                    )}
                    {onRemoveResident && (
                      <button
                        type="button"
                        onClick={() => onRemoveResident(resident.id)}
                        disabled={loading}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Eliminar residente"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
