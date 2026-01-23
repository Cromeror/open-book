'use client';

import { BarChart3, TrendingUp, TrendingDown, Users, Activity, DollarSign } from 'lucide-react';

/**
 * Metrics Tab
 * Display system metrics and KPIs
 */
export function MetricsTab() {
  const metrics = [
    {
      id: 'users',
      label: 'Usuarios Activos',
      value: '248',
      change: '+12%',
      trend: 'up',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      id: 'activity',
      label: 'Acciones Diarias',
      value: '1,234',
      change: '+8%',
      trend: 'up',
      icon: <Activity className="h-5 w-5 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      id: 'revenue',
      label: 'Recaudo Total',
      value: '$45.2M',
      change: '-3%',
      trend: 'down',
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Métricas del Sistema</h2>
          <p className="text-sm text-gray-500 mt-1">
            Indicadores clave de rendimiento y uso del sistema
          </p>
        </div>
        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option>Últimos 7 días</option>
          <option>Últimos 30 días</option>
          <option>Últimos 3 meses</option>
          <option>Último año</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>{metric.icon}</div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {metric.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Actividad por Día</h3>
            <button className="text-xs text-blue-600 hover:text-blue-700">Ver detalles</button>
          </div>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center text-gray-400">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">Gráfico de actividad</p>
              <p className="text-xs">(Por implementar)</p>
            </div>
          </div>
        </div>

        {/* Users Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Usuarios Activos</h3>
            <button className="text-xs text-blue-600 hover:text-blue-700">Ver detalles</button>
          </div>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">Gráfico de usuarios</p>
              <p className="text-xs">(Por implementar)</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">API Backend</span>
            </div>
            <span className="text-xs text-gray-500">Operacional</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Base de Datos</span>
            </div>
            <span className="text-xs text-gray-500">Operacional</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-700">Servicio de Notificaciones</span>
            </div>
            <span className="text-xs text-gray-500">Degradado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
