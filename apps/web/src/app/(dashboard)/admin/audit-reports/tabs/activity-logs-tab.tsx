'use client';

import { Activity, Search, Filter } from 'lucide-react';

/**
 * Activity Logs Tab
 * Displays system audit logs and user activity tracking
 */
export function ActivityLogsTab() {
  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Logs de Actividad</h2>
          <p className="text-sm text-gray-500 mt-1">
            Registro completo de acciones realizadas en el sistema
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en logs..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Todas las acciones</option>
            <option>Crear</option>
            <option>Actualizar</option>
            <option>Eliminar</option>
            <option>Login</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Todos los usuarios</option>
          </select>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Recurso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Placeholder - TODO: Connect to real data */}
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Activity className="h-8 w-8 text-gray-300" />
                    <p className="text-sm">No hay logs de actividad disponibles</p>
                    <p className="text-xs text-gray-400">
                      Los registros aparecerán aquí cuando se realicen acciones en el sistema
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
