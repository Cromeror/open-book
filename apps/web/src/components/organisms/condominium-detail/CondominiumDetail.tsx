'use client';

import type { CondominiumDetailProps, DetailFieldProps } from './types';
import { ManagersList } from './ManagersList';

/**
 * DetailField - Renders a single field with label and value
 */
function DetailField({ label, value, fallback = '-' }: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-sm text-gray-900">{value || fallback}</p>
    </div>
  );
}

/**
 * CondominiumDetail - Organism for displaying condominium details
 *
 * Displays all condominium information in a structured layout with action buttons.
 * Includes a section for assigned managers at the bottom.
 */
export function CondominiumDetail({
  condominium,
  managers = [],
  loadingManagers = false,
  loading = false,
  onEdit,
  onToggleStatus,
  onBack,
  onManageManagers,
  onRemoveManager,
}: CondominiumDetailProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{condominium.name}</h2>
          <p className="text-sm text-gray-500">Detalles del condominio</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(condominium)}
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
              className={`rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                condominium.isActive
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {condominium.isActive ? 'Desactivar' : 'Activar'}
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
        {/* Condominium Info */}
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Nombre" value={condominium.name} />
          <DetailField label="NIT" value={condominium.nit} />
          <DetailField label="Direccion" value={condominium.address} />
          <DetailField label="Ciudad" value={condominium.city} />
          <DetailField label="Telefono" value={condominium.phone} />
          <DetailField label="Correo" value={condominium.email} />

          {/* Status Field */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Estado</p>
            <p className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  condominium.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {condominium.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>

          {/* Created At Field */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Creado</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(condominium.createdAt).toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>

        {/* Managers Section */}
        <div className="border-t border-gray-200 pt-4">
          <ManagersList
            managers={managers}
            loading={loadingManagers}
            onRemove={onRemoveManager}
            onAdd={onManageManagers}
          />
        </div>
      </div>
    </div>
  );
}

export default CondominiumDetail;
