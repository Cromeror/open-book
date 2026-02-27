import { useState } from 'react';
import { Plus, Trash2, Link2 } from 'lucide-react';
import type { ResourceHttpMethodLink, ResourceLinkParamMapping, Resource } from '@/types/business';

export interface MethodLinksConfigProps {
  /** UUID of the source resource_http_methods row. Undefined for new methods not yet saved. */
  sourceMethodId?: string;
  links: ResourceHttpMethodLink[];
  /** All resources available for selection as link targets */
  allResources: Resource[];
  disabled: boolean;
  onChange: (links: ResourceHttpMethodLink[]) => void;
}

const inputClasses =
  'block w-full rounded border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';

/**
 * Inline link form for adding a new outbound HATEOAS link
 */
function NewLinkForm({
  allResources,
  disabled,
  onAdd,
  onCancel,
}: {
  allResources: Resource[];
  disabled: boolean;
  onAdd: (link: ResourceHttpMethodLink) => void;
  onCancel: () => void;
}) {
  const [rel, setRel] = useState('');
  const [targetMethodId, setTargetMethodId] = useState('');
  const [mappings, setMappings] = useState<ResourceLinkParamMapping[]>([]);
  const [relError, setRelError] = useState('');
  const [targetError, setTargetError] = useState('');

  // Flatten all resource http methods for the target dropdown
  const allMethods = allResources.flatMap((r) =>
    (r.httpMethods ?? [])
      .filter((hm) => !!hm.id)
      .map((hm) => ({
        id: hm.id!,
        label: `${r.code} › ${hm.name || hm.method.toLowerCase()}`,
        resourceCode: r.code,
      })),
  );

  const handleAddMapping = () => {
    setMappings((prev) => [...prev, { responseField: '', urlParam: '' }]);
  };

  const handleMappingChange = (
    index: number,
    field: 'responseField' | 'urlParam',
    value: string,
  ) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const handleRemoveMapping = (index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    let valid = true;

    if (!rel.trim()) {
      setRelError('El rel es requerido');
      valid = false;
    } else {
      setRelError('');
    }

    if (!targetMethodId) {
      setTargetError('Selecciona un método destino');
      valid = false;
    } else {
      setTargetError('');
    }

    if (!valid) return;

    const validMappings = mappings.filter(
      (m) => m.responseField.trim() && m.urlParam.trim(),
    );

    onAdd({
      rel: rel.trim(),
      targetHttpMethodId: targetMethodId,
      paramMappings: validMappings,
    });
  };

  return (
    <div className="rounded border border-blue-200 bg-blue-50 p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={rel}
            onChange={(e) => setRel(e.target.value)}
            disabled={disabled}
            placeholder="self, edit, delete, list..."
            className={inputClasses}
          />
          {relError && <p className="mt-1 text-xs text-red-500">{relError}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Método destino <span className="text-red-500">*</span>
          </label>
          <select
            value={targetMethodId}
            onChange={(e) => setTargetMethodId(e.target.value)}
            disabled={disabled}
            className={inputClasses}
          >
            <option value="">— Seleccionar —</option>
            {allMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {targetError && <p className="mt-1 text-xs text-red-500">{targetError}</p>}
        </div>
      </div>

      {/* Param mappings */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">Mapeo de parámetros</span>
          <button
            type="button"
            onClick={handleAddMapping}
            disabled={disabled}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Agregar
          </button>
        </div>

        {mappings.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            Sin mapeos — los parámetros de ruta serán tomados del contexto de sesión
          </p>
        )}

        {mappings.map((m, idx) => (
          <div key={idx} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={m.responseField}
              onChange={(e) => handleMappingChange(idx, 'responseField', e.target.value)}
              disabled={disabled}
              placeholder="campo respuesta (e.g. id)"
              className={`${inputClasses} flex-1`}
            />
            <span className="text-xs text-gray-400">→</span>
            <input
              type="text"
              value={m.urlParam}
              onChange={(e) => handleMappingChange(idx, 'urlParam', e.target.value)}
              disabled={disabled}
              placeholder="param URL (e.g. goalId)"
              className={`${inputClasses} flex-1`}
            />
            <button
              type="button"
              onClick={() => handleRemoveMapping(idx)}
              disabled={disabled}
              className="text-red-400 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Agregar link
        </button>
      </div>
    </div>
  );
}

/**
 * Component for configuring outbound HATEOAS links on a resource HTTP method.
 *
 * Renders a list of configured links plus an "Agregar link" button that expands
 * an inline form. Changes are surfaced via `onChange` — they are persisted when
 * the parent form is submitted.
 */
export function MethodLinksConfig({
  links,
  allResources,
  disabled,
  onChange,
}: MethodLinksConfigProps) {
  const [showForm, setShowForm] = useState(false);

  // Build a lookup map: targetHttpMethodId → display label
  const methodLabels = new Map<string, string>();
  for (const r of allResources) {
    for (const hm of r.httpMethods ?? []) {
      if (hm.id) {
        methodLabels.set(hm.id, `${r.code} › ${hm.name || hm.method.toLowerCase()}`);
      }
    }
  }

  const handleAdd = (link: ResourceHttpMethodLink) => {
    onChange([...links, link]);
    setShowForm(false);
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
        <Link2 className="h-3.5 w-3.5" />
        Links de salida
      </div>

      {links.length === 0 && !showForm && (
        <p className="text-xs text-gray-400 italic">Sin links configurados</p>
      )}

      {links.map((link, idx) => (
        <div
          key={idx}
          className="flex items-start justify-between rounded border border-gray-200 bg-white px-3 py-2"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-gray-700">
                {link.rel}
              </span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs text-gray-600">
                {methodLabels.get(link.targetHttpMethodId) ?? link.targetHttpMethodId}
              </span>
            </div>
            {link.paramMappings.length > 0 && (
              <div className="flex flex-wrap gap-1 pl-1">
                {link.paramMappings.map((pm, pmIdx) => (
                  <span key={pmIdx} className="text-xs text-gray-400 font-mono">
                    {pm.responseField} → {pm.urlParam}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            disabled={disabled}
            className="ml-2 text-red-400 hover:text-red-600 disabled:opacity-50"
            title="Eliminar link"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {showForm && (
        <NewLinkForm
          allResources={allResources}
          disabled={disabled}
          onAdd={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          disabled={disabled}
          className="flex items-center gap-1 rounded border border-dashed border-gray-300 px-2 py-1 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 w-full justify-center"
        >
          <Plus className="h-3 w-3" />
          Agregar link
        </button>
      )}
    </div>
  );
}
