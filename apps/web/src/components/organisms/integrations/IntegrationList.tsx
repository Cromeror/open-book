'use client';

import { useState, useMemo } from 'react';
import type { Integration } from '@/types/business/integration.types';
import { Eye, Trash2, Power } from 'lucide-react';

export interface IntegrationListProps {
  integrations: Integration[];
  onSelectIntegration: (integration: Integration) => void;
  onDeleteIntegration?: (integration: Integration) => void;
  onToggleStatus?: (integration: Integration) => void;
  onCreateIntegration?: () => void;
  loading?: boolean;
}

const AUTH_TYPE_LABELS: Record<string, string> = {
  none: 'Sin auth',
  bearer: 'Bearer Token',
  basic: 'Basic Auth',
  api_key: 'API Key',
  devise_token_auth: 'Devise Token Auth',
};

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  passthrough: 'Passthrough',
  oauth: 'OAuth',
  api_key_stored: 'API Key (stored)',
};

export function IntegrationList({
  integrations,
  onSelectIntegration,
  onDeleteIntegration,
  onToggleStatus,
  onCreateIntegration,
  loading = false,
}: IntegrationListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredIntegrations = useMemo(() => {
    if (!integrations || integrations.length === 0) return [];

    return integrations.filter((integration) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          integration.code.toLowerCase().includes(searchLower) ||
          integration.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (statusFilter === 'active' && !integration.isActive) return false;
      if (statusFilter === 'inactive' && integration.isActive) return false;

      return true;
    });
  }, [integrations, search, statusFilter]);

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
            <h2 className="text-lg font-semibold text-gray-900">Integraciones</h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredIntegrations.length} de {integrations.length} integraciones
            </p>
          </div>
          {onCreateIntegration && (
            <button
              type="button"
              onClick={onCreateIntegration}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Nueva Integracion
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Buscar por codigo o nombre..."
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
        {filteredIntegrations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {search || statusFilter !== 'all'
              ? 'No se encontraron integraciones con los filtros aplicados'
              : 'No hay integraciones registradas'}
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
                  Base URL
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Auth
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Conexion
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
              {filteredIntegrations.map((integration) => (
                <tr key={integration.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-900">
                      {integration.code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {integration.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="truncate block max-w-xs font-mono text-xs text-gray-600">
                      {integration.baseUrl}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {AUTH_TYPE_LABELS[integration.authType] || integration.authType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {CONNECTION_TYPE_LABELS[integration.connectionType] || integration.connectionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {getStatusBadge(integration.isActive)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectIntegration(integration)}
                        disabled={loading}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(integration)}
                          disabled={loading}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title={integration.isActive ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                      {onDeleteIntegration && (
                        <button
                          type="button"
                          onClick={() => onDeleteIntegration(integration)}
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
