import { Building2, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function ProjectDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Project Header */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Remodelación Zona Común
                </h1>
                <p className="text-sm text-gray-500">
                  Conjunto Residencial Los Pinos - Torre A
                </p>
              </div>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            En curso
          </span>
        </div>

        <p className="mt-4 text-gray-600">
          Proyecto de remodelación del salón comunal, zona de juegos infantiles y
          áreas verdes del conjunto. Incluye nueva iluminación LED, mobiliario y
          paisajismo.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-500">Meta</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">$45.000.000</p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Recaudado</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">$31.500.000</p>
          <p className="text-sm text-gray-500">70% completado</p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-500">Participantes</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">48 / 60</p>
          <p className="text-sm text-gray-500">apartamentos</p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-500">Fecha límite</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">30 Abr</p>
          <p className="text-sm text-gray-500">2026</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Progreso del Recaudo</h2>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: '70%' }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>$0</span>
          <span>$31.500.000 de $45.000.000</span>
        </div>
      </div>

      {/* Activities */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Actividades de Recaudo</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="font-medium text-gray-900">Cuota ordinaria Enero</p>
              <p className="text-sm text-gray-500">Cuota mensual por apartamento</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">$12.000.000</p>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Completado
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="font-medium text-gray-900">Cuota ordinaria Febrero</p>
              <p className="text-sm text-gray-500">Cuota mensual por apartamento</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">$10.500.000</p>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Completado
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="font-medium text-gray-900">Cuota ordinaria Marzo</p>
              <p className="text-sm text-gray-500">Cuota mensual por apartamento</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">$9.000.000</p>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                En curso
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="font-medium text-gray-900">Rifa Día de la Madre</p>
              <p className="text-sm text-gray-500">Actividad especial de recaudo</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">$0</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                Pendiente
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
