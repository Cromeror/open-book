'use client';

import type { PropertyDetailProps, DetailFieldProps } from './types';
import { PropertyTypeLabels, PropertyTypeIcons } from '../PropertyList';

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
  loading = false,
  onEdit,
  onToggleStatus,
  onBack,
}: PropertyDetailProps) {
  return (
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
  );
}

export default PropertyDetail;
