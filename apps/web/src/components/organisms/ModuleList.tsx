'use client';

import { useState, useMemo } from 'react';
import { Eye, Edit, Power } from 'lucide-react';
import { PageTitle } from '@/components/molecules';

// Types
export interface ModulePermission {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface NavConfig {
  path: string;
  order: number;
}

export interface ModuleListItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  tags?: string[];
  isActive: boolean;
  order: number;
  permissions?: ModulePermission[];
}

export interface ModuleListProps {
  modules: ModuleListItem[];
  selectedModuleId?: string | null;
  onSelectModule: (module: ModuleListItem) => void;
  onEditModule?: (module: ModuleListItem) => void;
  onToggleStatus?: (module: ModuleListItem) => void;
  onCreateModule?: () => void;
  loading?: boolean;
}

/**
 * ModuleList - Organism component
 *
 * Displays a filterable table of system modules with action buttons.
 * Does not make API calls - receives data and emits events.
 */
export function ModuleList({
  modules,
  selectedModuleId,
  onSelectModule,
  onEditModule,
  onToggleStatus,
  onCreateModule,
  loading = false,
}: ModuleListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    return Array.from(new Set(modules.flatMap((m) => m.tags || []))).sort();
  }, [modules]);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !module.code.toLowerCase().includes(q) &&
          !module.name.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter === 'active' && !module.isActive) return false;
      if (statusFilter === 'inactive' && module.isActive) return false;
      if (tagFilter && !module.tags?.includes(tagFilter)) return false;
      return true;
    });
  }, [modules, search, statusFilter, tagFilter]);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        Inactivo
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <PageTitle
            title="Módulos del Sistema"
            tooltip={
              <>
                <p className="font-semibold text-gray-800 mb-1">¿Cómo funciona?</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Módulos</strong>: representan las funcionalidades del sistema accesibles desde la navegación.</li>
                  <li><strong>Permisos</strong>: cada módulo define las acciones disponibles (leer, crear, actualizar, eliminar).</li>
                  <li><strong>Recursos</strong>: los módulos se asocian a recursos HATEOAS para inferir sus capacidades.</li>
                </ul>
              </>
            }
          />
          {onCreateModule && (
            <button
              type="button"
              onClick={onCreateModule}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Nuevo Modulo
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
          {/* Status filter */}
          <div className="flex gap-1">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${statusFilter === s
                  ? s === 'active'
                    ? 'bg-emerald-600 text-white'
                    : s === 'inactive'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-800 text-white'
                  : s === 'active'
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${tagFilter === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredModules.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {search || statusFilter !== 'all' || tagFilter
              ? 'No se encontraron modulos con los filtros aplicados'
              : 'No hay modulos registrados'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tags
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Permisos
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredModules.map((module) => (
                <tr
                  key={module.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedModuleId === module.id ? 'bg-blue-50' : ''
                    } ${!module.isActive ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3 text-sm">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-900">
                      {module.code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {module.name}
                    {module.description && (
                      <p className="text-xs font-normal text-gray-500 mt-0.5 truncate max-w-xs">
                        {module.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {module.tags && module.tags.length > 0 ? (
                        module.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-gray-900">
                      {module.permissions?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {getStatusBadge(module.isActive)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectModule(module)}
                        disabled={loading}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {onEditModule && (
                        <button
                          type="button"
                          onClick={() => onEditModule(module)}
                          disabled={loading}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(module)}
                          disabled={loading}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title={module.isActive ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="h-4 w-4" />
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

export default ModuleList;
