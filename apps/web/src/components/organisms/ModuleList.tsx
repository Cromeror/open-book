'use client';

import { useState, useMemo } from 'react';
import { getIconEmoji } from '@/lib/constants';

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
  type: 'crud' | 'specialized';
  tags?: string[];
  isActive: boolean;
  permissions?: ModulePermission[];
}

export interface ModuleListProps {
  modules: ModuleListItem[];
  selectedModuleId?: string | null;
  onSelectModule: (module: ModuleListItem) => void;
  onCreateModule?: () => void;
  loading?: boolean;
}

/**
 * ModuleList - Organism component
 *
 * Displays a filterable list of modules with tag-based filtering.
 * Does not make API calls - receives data and emits events.
 */
export function ModuleList({
  modules,
  selectedModuleId,
  onSelectModule,
  onCreateModule,
  loading = false,
}: ModuleListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags from modules
  const allTags = useMemo(() => {
    return Array.from(
      new Set(modules.flatMap((m) => m.tags || []))
    ).sort();
  }, [modules]);

  // Filter modules by selected tag
  const filteredModules = useMemo(() => {
    return selectedTag
      ? modules.filter((m) => m.tags?.includes(selectedTag))
      : modules;
  }, [modules, selectedTag]);

  const getTypeLabel = (type: string) => {
    return type === 'crud' ? 'CRUD' : 'Especializado';
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'crud'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Modulos</h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredModules.length} de {modules.length} modulos
            </p>
          </div>
          {onCreateModule && (
            <button
              type="button"
              onClick={onCreateModule}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Nuevo
            </button>
          )}
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                  selectedTag === tag
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

      {/* Module List */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredModules.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {selectedTag
              ? `No hay modulos con tag "${selectedTag}"`
              : 'No hay modulos registrados'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredModules.map((module) => (
              <li key={module.id}>
                <button
                  type="button"
                  onClick={() => onSelectModule(module)}
                  disabled={loading}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedModuleId === module.id ? 'bg-blue-50' : ''
                  } ${!module.isActive ? 'opacity-60' : ''} ${
                    loading ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" title={module.icon || 'Module'}>
                        {getIconEmoji(module.icon)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {module.name}
                          </p>
                          {!module.isActive && (
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          <code>{module.code}</code>
                        </p>
                        {module.tags && module.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {module.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${getTypeBadgeColor(
                        module.type
                      )}`}
                    >
                      {getTypeLabel(module.type)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ModuleList;
