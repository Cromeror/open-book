'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal } from '@/components/atoms';

interface ResourceInfo {
  id: string;
  code: string;
  name: string;
  requiresExternalAuth: boolean;
  httpMethods: {
    id: string;
    httpMethod: { id: string; method: string };
  }[];
}

export interface ResourceAccessSelection {
  resourceId: string;
  resourceHttpMethodId: string | null;
  responseFilter: {
    field: string;
    type: 'include' | 'exclude';
    values: string[];
  } | null;
}

export interface ResourceAccessModalProps {
  isOpen: boolean;
  roleName?: string;
  loading?: boolean;
  existingAccess?: { resourceId: string; resourceHttpMethodId?: string | null }[];
  onConfirm: (selection: ResourceAccessSelection) => void;
  onCancel: () => void;
}

export function ResourceAccessModal({
  isOpen,
  roleName,
  loading = false,
  existingAccess = [],
  onConfirm,
  onCancel,
}: ResourceAccessModalProps) {
  const [resources, setResources] = useState<ResourceInfo[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [useFilter, setUseFilter] = useState(false);
  const [filterField, setFilterField] = useState('');
  const [filterType, setFilterType] = useState<'include' | 'exclude'>('include');
  const [filterValues, setFilterValues] = useState('');
  const [loadingResources, setLoadingResources] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedResourceId('');
      setSelectedMethodId(null);
      setUseFilter(false);
      setFilterField('');
      setFilterType('include');
      setFilterValues('');
      setError(null);
    }
  }, [isOpen]);

  // Fetch resources when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        const response = await fetch('/api/admin/resources?isActive=true&limit=100');
        if (!response.ok) throw new Error('Error al cargar recursos');
        const result = await response.json();
        const data: ResourceInfo[] = result.data ?? [];
        setResources(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, [isOpen]);

  const selectedResource = useMemo(
    () => resources.find((r) => r.id === selectedResourceId),
    [resources, selectedResourceId],
  );

  const existingSet = useMemo(() => {
    const set = new Set<string>();
    for (const a of existingAccess) {
      set.add(`${a.resourceId}:${a.resourceHttpMethodId ?? 'ALL'}`);
    }
    return set;
  }, [existingAccess]);

  const isAlreadyGranted = useCallback(
    (resourceId: string, methodId: string | null) => {
      return existingSet.has(`${resourceId}:${methodId ?? 'ALL'}`);
    },
    [existingSet],
  );

  const handleResourceChange = useCallback((resourceId: string) => {
    setSelectedResourceId(resourceId);
    setSelectedMethodId(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedResourceId) return;

    const responseFilter =
      useFilter && filterField.trim() && filterValues.trim()
        ? {
            field: filterField.trim(),
            type: filterType,
            values: filterValues
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean),
          }
        : null;

    onConfirm({
      resourceId: selectedResourceId,
      resourceHttpMethodId: selectedMethodId,
      responseFilter,
    });
  }, [selectedResourceId, selectedMethodId, useFilter, filterField, filterType, filterValues, onConfirm]);

  const canConfirm =
    selectedResourceId &&
    !isAlreadyGranted(selectedResourceId, selectedMethodId) &&
    !loading;

  const footer = (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Asignando...' : 'Asignar Acceso'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Asignar Acceso a Recurso"
      subtitle={roleName}
      size="2xl"
      preventClose={loading}
      footer={footer}
    >
      <div className="space-y-4">
        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Resource */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recurso
          </label>
          {loadingResources ? (
            <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando recursos...
            </div>
          ) : resources.length === 0 ? (
            <p className="py-2 text-sm text-gray-500">
              No hay recursos externos configurados
            </p>
          ) : (
            <select
              value={selectedResourceId}
              onChange={(e) => handleResourceChange(e.target.value)}
              disabled={loading}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Seleccione un recurso...</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: HTTP Method */}
        {selectedResource && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metodo HTTP
            </label>
            <div className="space-y-1">
              {/* Wildcard option */}
              <label
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  selectedMethodId === null
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : isAlreadyGranted(selectedResourceId, null)
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="httpMethod"
                  checked={selectedMethodId === null}
                  onChange={() => setSelectedMethodId(null)}
                  disabled={isAlreadyGranted(selectedResourceId, null) || loading}
                  className="text-blue-600"
                />
                <span className="font-medium">TODOS</span>
                <span className="text-gray-500">Acceso a todos los metodos</span>
                {isAlreadyGranted(selectedResourceId, null) && (
                  <span className="ml-auto text-xs text-gray-400">Ya asignado</span>
                )}
              </label>

              {/* Specific methods */}
              {selectedResource.httpMethods
                .filter((rhm) => rhm.httpMethod)
                .map((rhm) => {
                const alreadyGranted = isAlreadyGranted(selectedResourceId, rhm.id);
                return (
                  <label
                    key={rhm.id}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                      selectedMethodId === rhm.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : alreadyGranted
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="httpMethod"
                      checked={selectedMethodId === rhm.id}
                      onChange={() => setSelectedMethodId(rhm.id)}
                      disabled={alreadyGranted || loading}
                      className="text-blue-600"
                    />
                    <code className="font-medium">{rhm.httpMethod.method}</code>
                    {alreadyGranted && (
                      <span className="ml-auto text-xs text-gray-400">Ya asignado</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Response filter (optional) */}
        {selectedResource && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useFilter}
                onChange={(e) => setUseFilter(e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="font-medium text-gray-700">Filtro de respuesta (opcional)</span>
            </label>

            {useFilter && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Campo</label>
                    <input
                      type="text"
                      value={filterField}
                      onChange={(e) => setFilterField(e.target.value)}
                      placeholder="ej: code"
                      disabled={loading}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Tipo</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as 'include' | 'exclude')}
                      disabled={loading}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="include">Incluir</option>
                      <option value="exclude">Excluir</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">
                    Valores (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={filterValues}
                    onChange={(e) => setFilterValues(e.target.value)}
                    placeholder="ej: 1, 2, 3"
                    disabled={loading}
                    className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ResourceAccessModal;
