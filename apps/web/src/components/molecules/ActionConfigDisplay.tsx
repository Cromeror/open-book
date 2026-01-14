import type { ActionSettings } from '@/components/organisms';

export interface ActionConfigDisplayProps {
  settings: ActionSettings;
}

/**
 * ActionConfigDisplay - Molecule component
 *
 * Displays the details of an action configuration.
 * Shows columns, filters, fields, and other settings based on action type.
 */
export function ActionConfigDisplay({ settings }: ActionConfigDisplayProps) {
  return (
    <div className="space-y-3 text-xs">
      {/* List Columns for read actions */}
      {settings.listColumns && settings.listColumns.length > 0 && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Columnas de Lista:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-gray-600">Campo</th>
                  <th className="px-2 py-1 text-left text-gray-600">Etiqueta</th>
                  <th className="px-2 py-1 text-left text-gray-600">Ordenable</th>
                  <th className="px-2 py-1 text-left text-gray-600">Formato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.listColumns.map((col, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">
                      <code className="text-blue-600">{col.field}</code>
                    </td>
                    <td className="px-2 py-1 text-gray-600">{col.label}</td>
                    <td className="px-2 py-1">
                      {col.sortable ? (
                        <span className="text-green-600">Si</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-gray-500">{col.format || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Default Sort */}
      {settings.defaultSort && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Orden por Defecto:</p>
          <code className="bg-gray-100 px-2 py-0.5 rounded">
            {settings.defaultSort.field} ({settings.defaultSort.order})
          </code>
        </div>
      )}

      {/* Filters */}
      {settings.filters && settings.filters.length > 0 && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Filtros:</p>
          <div className="flex flex-wrap gap-1">
            {settings.filters.map((filter, i) => (
              <span
                key={i}
                className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded"
                title={`Tipo: ${filter.type}`}
              >
                {filter.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      {settings.fields && settings.fields.length > 0 && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Campos del Formulario:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-gray-600">Nombre</th>
                  <th className="px-2 py-1 text-left text-gray-600">Etiqueta</th>
                  <th className="px-2 py-1 text-left text-gray-600">Tipo</th>
                  <th className="px-2 py-1 text-left text-gray-600">Requerido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.fields.map((field, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">
                      <code className="text-blue-600">{field.name}</code>
                    </td>
                    <td className="px-2 py-1 text-gray-600">{field.label}</td>
                    <td className="px-2 py-1 text-gray-500">{field.type}</td>
                    <td className="px-2 py-1">
                      {field.required ? (
                        <span className="text-red-600">Si</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {settings.confirmation && (
        <div>
          <p className="font-medium text-gray-700 mb-1">Mensaje de Confirmacion:</p>
          <p className="text-gray-600 italic">&quot;{settings.confirmation}&quot;</p>
          {settings.soft !== undefined && (
            <p className="text-gray-500 mt-1">
              Borrado: {settings.soft ? 'Logico (soft delete)' : 'Permanente'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ActionConfigDisplay;
