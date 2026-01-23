'use client';

import { useState, useMemo } from 'react';
import { Resource, ResourceScope } from '@/types/resources';
import { Eye, Edit, Trash2, Power } from 'lucide-react';

export interface ResourceListProps {
  resources: Resource[];
  onSelectResource: (resource: Resource) => void;
  onEditResource?: (resource: Resource) => void;
  onDeleteResource?: (resource: Resource) => void;
  onToggleStatus?: (resource: Resource) => void;
  onCreateResource?: () => void;
  loading?: boolean;
}

/**
 * ResourceList - Organism component
 *
 * Displays a filterable table of HATEOAS resources with action buttons.
 * Does not make API calls - receives data and emits events.
 */
export function ResourceList({
  resources,
  onSelectResource,
  onEditResource,
  onDeleteResource,
  onToggleStatus,
  onCreateResource,
  loading = false,
}: ResourceListProps) {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ResourceScope | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter resources
  const filteredResources = useMemo(() => {
    if (!resources || resources.length === 0) {
      return [];
    }

    return resources.filter((resource) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          resource.code.toLowerCase().includes(searchLower) ||
          resource.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Scope filter
      if (scopeFilter !== 'all' && resource.scope !== scopeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && !resource.isActive) return false;
      if (statusFilter === 'inactive' && resource.isActive) return false;

      return true;
    });
  }, [resources, search, scopeFilter, statusFilter]);

  const getScopeBadge = (scope: ResourceScope) => {
    if (scope === 'global') {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          Global
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        Condominium
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        Inactive
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recursos HATEOAS</h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredResources.length} de {resources.length} recursos
            </p>
          </div>
          {onCreateResource && (
            <button
              type="button"
              onClick={onCreateResource}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Nuevo Recurso
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        {/* Filters */}
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Scope Filter */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                scopeFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('global')}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                scopeFilter === 'global'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Global
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('condominium')}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                scopeFilter === 'condominium'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Condominium
            </button>
          </div>

          {/* Status Filter */}
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
              Activos
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
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Resource Table */}
      <div className="overflow-x-auto">
        {filteredResources.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {search || scopeFilter !== 'all' || statusFilter !== 'all'
              ? 'No se encontraron recursos con los filtros aplicados'
              : 'No hay recursos registrados'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Scope
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Base URL
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Capabilities
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredResources.map((resource) => (
                <tr
                  key={resource.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-900">
                      {resource.code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {resource.name}
                  </td>
                  <td className="px-4 py-3 text-sm">{getScopeBadge(resource.scope)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="truncate block max-w-xs font-mono text-xs text-gray-600">
                      {resource.baseUrl}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-gray-900">{resource.capabilities.length}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {getStatusBadge(resource.isActive)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectResource(resource)}
                        disabled={loading}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {onEditResource && (
                        <button
                          type="button"
                          onClick={() => onEditResource(resource)}
                          disabled={loading}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(resource)}
                          disabled={loading}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title={resource.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                      {onDeleteResource && (
                        <button
                          type="button"
                          onClick={() => onDeleteResource(resource)}
                          disabled={loading}
                          className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
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

export default ResourceList;
