'use client';

import { useState, useEffect, useCallback } from 'react';
import { PropertiesManager } from './properties-manager';

interface Condominium {
  id: string;
  name: string;
  nit?: string;
  city?: string;
  isActive: boolean;
}

export function PropertiesPage() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondominium, setSelectedCondominium] = useState<Condominium | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch condominiums for selector
  const fetchCondominiums = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/condominiums?limit=100&isActive=true');
      if (!response.ok) {
        throw new Error('Error al cargar condominios');
      }

      const data = await response.json();
      const items = data.data || data.items || (Array.isArray(data) ? data : []);
      setCondominiums(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCondominiums();
  }, [fetchCondominiums]);

  // If no condominium selected, show selector
  if (!selectedCondominium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-gray-600">Seleccione un condominio para gestionar sus propiedades</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <span className="ml-3 text-gray-600">Cargando condominios...</span>
            </div>
          </div>
        ) : condominiums.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">No hay condominios disponibles</p>
            <a
              href="/admin/condominiums"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              Crear un condominio
            </a>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white shadow">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Seleccionar Condominio</h2>
              <p className="text-sm text-gray-500">
                {condominiums.length} {condominiums.length === 1 ? 'condominio disponible' : 'condominios disponibles'}
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {condominiums.map((condo) => (
                <button
                  key={condo.id}
                  type="button"
                  onClick={() => setSelectedCondominium(condo)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏢</span>
                      <div>
                        <p className="font-medium text-gray-900">{condo.name}</p>
                        <p className="text-sm text-gray-500">
                          {condo.nit && `NIT: ${condo.nit}`}
                          {condo.nit && condo.city && ' - '}
                          {condo.city}
                        </p>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show properties manager with selected condominium
  return (
    <div className="space-y-4">
      {/* Back button to selector */}
      <button
        type="button"
        onClick={() => setSelectedCondominium(null)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Cambiar condominio
      </button>

      <PropertiesManager
        condominiumId={selectedCondominium.id}
        condominiumName={selectedCondominium.name}
      />
    </div>
  );
}

export default PropertiesPage;
