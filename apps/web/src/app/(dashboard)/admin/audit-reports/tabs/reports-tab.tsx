'use client';

import { FileBarChart, Download, Calendar, FileText, DollarSign, Users } from 'lucide-react';

/**
 * Reports Tab
 * Generate and download system reports
 */
export function ReportsTab() {
  const reportTypes = [
    {
      id: 'financial',
      title: 'Reporte Financiero',
      description: 'Estado de recaudo, aportes y objetivos',
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      id: 'users',
      title: 'Reporte de Usuarios',
      description: 'Listado de usuarios activos e inactivos',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      id: 'activity',
      title: 'Reporte de Actividad',
      description: 'Resumen de acciones y logs del sistema',
      icon: <FileText className="h-5 w-5 text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Generación de Reportes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Descarga reportes en PDF o Excel para análisis y auditoría
        </p>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${report.bgColor}`}>{report.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                <Download className="h-3 w-3" />
                PDF
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                <Download className="h-3 w-3" />
                Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range Selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Configurar Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Condominio (opcional)
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos los condominios</option>
              <option>Condominio A</option>
              <option>Condominio B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Reportes Recientes</h3>
        </div>
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <FileBarChart className="h-8 w-8 text-gray-300" />
            <p className="text-sm">No hay reportes generados</p>
            <p className="text-xs text-gray-400">
              Los reportes que generes aparecerán aquí para descarga posterior
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
