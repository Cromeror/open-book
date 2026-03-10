'use client';

import { useState, useMemo } from 'react';
import type { Organization } from '@/types/business/organization.types';
import { Eye, Trash2, Power, Pencil } from 'lucide-react';

export interface OrganizationListProps {
  organizations: Organization[];
  onSelectOrganization: (organization: Organization) => void;
  onEditOrganization?: (organization: Organization) => void;
  onDeleteOrganization?: (organization: Organization) => void;
  onToggleStatus?: (organization: Organization) => void;
  onCreateOrganization?: () => void;
  loading?: boolean;
}

export function OrganizationList({
  organizations,
  onSelectOrganization,
  onEditOrganization,
  onDeleteOrganization,
  onToggleStatus,
  onCreateOrganization,
  loading = false,
}: OrganizationListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredOrganizations = useMemo(() => {
    if (!organizations || organizations.length === 0) return [];

    return organizations.filter((org) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          org.code.toLowerCase().includes(searchLower) ||
          org.name.toLowerCase().includes(searchLower) ||
          (org.externalId?.toLowerCase().includes(searchLower) ?? false);
        if (!matchesSearch) return false;
      }

      if (statusFilter === 'active' && !org.isActive) return false;
      if (statusFilter === 'inactive' && org.isActive) return false;

      return true;
    });
  }, [organizations, search, statusFilter]);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          Activa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        Inactiva
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Organizaciones</h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredOrganizations.length} de {organizations.length} organizaciones
            </p>
          </div>
          {onCreateOrganization && (
            <button
              type="button"
              onClick={onCreateOrganization}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Nueva Organizacion
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Buscar por codigo, nombre o ID externo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Activas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactivas
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredOrganizations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {search || statusFilter !== 'all'
              ? 'No se encontraron organizaciones con los filtros aplicados'
              : 'No hay organizaciones registradas'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Code
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ID Externo
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Integracion
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-900">
                      {org.code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {org.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {org.externalId ? (
                      <code className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-mono text-amber-700">
                        {org.externalId}
                      </code>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Sin ID</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {org.integration ? (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {org.integration.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Local</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {getStatusBadge(org.isActive)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectOrganization(org)}
                        disabled={loading}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {onEditOrganization && (
                        <button
                          type="button"
                          onClick={() => onEditOrganization(org)}
                          disabled={loading}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(org)}
                          disabled={loading}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title={org.isActive ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                      {onDeleteOrganization && (
                        <button
                          type="button"
                          onClick={() => onDeleteOrganization(org)}
                          disabled={loading}
                          className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
