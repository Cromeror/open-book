'use client';

import { useState, useCallback, useEffect } from 'react';
import { Info } from 'lucide-react';
import { ICON_MAP, AVAILABLE_ICONS } from '@/lib/constants';
import { Section } from '@/components/molecules';
import type { ModuleEditFormProps, ModuleFormData, ValidationError } from './types';
import { validateModuleForm, normalizeCode, normalizeTags } from './validation';
import { ActionsConfigEditor } from './ActionsConfigEditor';
import { registeredComponentNames, resolveWidgetSchema } from '@/components/modules';
import { JsonEditor } from '@/components/molecules';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-700';

/**
 * ModuleEditForm - Organism component
 *
 * Form for editing existing modules.
 * Performs client-side validation and emits onSubmit with form data.
 * Does not make update API calls directly.
 */
export function ModuleEditForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  permissions = [],
}: ModuleEditFormProps) {
  const [formData, setFormData] = useState<ModuleFormData>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState((initialData.tags || []).join(', '));

  useEffect(() => {
    setFormData(initialData);
    setTagsInput((initialData.tags || []).join(', '));
    setErrors([]);
  }, [initialData]);

  const getFieldError = useCallback(
    (field: string): string | undefined => errors.find((e) => e.field === field)?.message,
    [errors],
  );

  const handleFieldChange = useCallback(
    <K extends keyof ModuleFormData>(field: K, value: ModuleFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    [],
  );

  const handleCodeChange = useCallback(
    (value: string) => handleFieldChange('code', normalizeCode(value)),
    [handleFieldChange],
  );

  const handleTagsChange = useCallback(
    (value: string) => {
      setTagsInput(value);
      handleFieldChange('tags', normalizeTags(value));
    },
    [handleFieldChange],
  );

  const handleNavPathChange = useCallback((path: string) => {
    setFormData((prev) => ({
      ...prev,
      navConfig: { ...prev.navConfig, path, order: prev.navConfig?.order ?? 0 },
    }));
    setErrors((prev) => prev.filter((e) => e.field !== 'navConfig.path'));
  }, []);

  const handleNavOrderChange = useCallback((order: number) => {
    setFormData((prev) => ({
      ...prev,
      navConfig: { ...prev.navConfig, path: prev.navConfig?.path ?? '', order },
    }));
  }, []);

  const handleComponentChange = useCallback((value: string | undefined) => {
    setFormData((prev) => ({ ...prev, component: value, componentConfig: undefined }));
    setConfigErrors([]);
    setErrors((prev) => prev.filter((e) => e.field !== 'componentConfig'));
  }, []);

  const handleConfigChange = useCallback((parsed: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, componentConfig: parsed }));
    const schema = resolveWidgetSchema(formData.component);
    if (schema) {
      const result = schema.safeParse(parsed);
      if (!result.success) {
        setConfigErrors(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
      } else {
        setConfigErrors([]);
      }
    }
  }, [formData.component]);

  const handleActionsChange = useCallback((actions: ModuleFormData['actionsConfig']) => {
    setFormData((prev) => ({ ...prev, actionsConfig: actions }));
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateModuleForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    // Validate componentConfig with the widget's Zod schema
    if (formData.component) {
      const schema = resolveWidgetSchema(formData.component);
      if (schema) {
        const result = schema.safeParse(formData.componentConfig ?? {});
        if (!result.success) {
          setConfigErrors(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
          setErrors([{ field: 'componentConfig', message: 'La configuracion del widget es invalida' }]);
          return;
        }
      }
    }
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <div className="space-y-6">
      {/* Informacion General */}
      <Section title="Información General" titlePrefix={<Info className="h-4 w-4 text-blue-500" />}>
        {/* Row 1: Icono, Codigo, Nombre */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClasses}>Icono</label>
            <select
              value={formData.icon || ''}
              onChange={(e) => handleFieldChange('icon', e.target.value)}
              className={inputClasses}
              disabled={loading}
            >
              <option value="">Seleccionar icono</option>
              {AVAILABLE_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {ICON_MAP[icon]} {icon}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Código</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className={`${inputClasses} ${getFieldError('code') ? 'border-red-500' : ''}`}
              placeholder="ej: objetivos"
              disabled={loading}
            />
            {getFieldError('code') ? (
              <p className="mt-1 text-xs text-red-500">{getFieldError('code')}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Minúsculas, números y guion bajo</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`${inputClasses} ${getFieldError('name') ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {getFieldError('name') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('name')}</p>
            )}
          </div>
        </div>

        {/* Row 2: Descripcion */}
        <div className="mt-3">
          <label className={labelClasses}>Descripción (Opcional)</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className={`${inputClasses} resize-none ${getFieldError('description') ? 'border-red-500' : ''}`}
            rows={2}
            disabled={loading}
          />
          {getFieldError('description') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('description')}</p>
          )}
        </div>

        {/* Row 3: Tags */}
        <div className="mt-3">
          <label className={labelClasses}>Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => handleTagsChange(e.target.value)}
            className={`${inputClasses} ${getFieldError('tags') ? 'border-red-500' : ''}`}
            placeholder="navigation, admin, reports (separados por coma)"
            disabled={loading}
          />
          {getFieldError('tags') ? (
            <p className="mt-1 text-xs text-red-500">{getFieldError('tags')}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Separar tags con comas</p>
          )}
        </div>
      </Section>

      {/* Configuracion de Navegacion */}
      <Section title="Navegacion" titlePrefix={<Info className="h-4 w-4 text-blue-500" />}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Ruta de navegacion</label>
            <input
              type="text"
              value={formData.navConfig?.path || ''}
              onChange={(e) => handleNavPathChange(e.target.value)}
              className={`${inputClasses} ${getFieldError('navConfig.path') ? 'border-red-500' : ''}`}
              placeholder="ej: /m/users"
              disabled={loading}
            />
            {getFieldError('navConfig.path') ? (
              <p className="mt-1 text-xs text-red-500">{getFieldError('navConfig.path')}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Ruta en el frontend donde se renderiza el modulo</p>
            )}
          </div>
          <div>
            <label className={labelClasses}>Orden en navegacion</label>
            <input
              type="number"
              value={formData.navConfig?.order ?? 0}
              onChange={(e) => handleNavOrderChange(parseInt(e.target.value, 10) || 0)}
              className={inputClasses}
              min={0}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">Posicion en el menu de navegacion</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Endpoint API</label>
            <input
              type="text"
              value={formData.endpoint || ''}
              onChange={(e) => handleFieldChange('endpoint', e.target.value)}
              className={inputClasses}
              placeholder="ej: /api/admin/users"
              disabled={loading}
            />
          </div>
          <div>
            <label className={labelClasses}>Componente</label>
            <select
              value={formData.component || ''}
              onChange={(e) => handleComponentChange(e.target.value || undefined)}
              className={`${inputClasses} disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-60`}
              disabled={loading || registeredComponentNames.length === 0}
            >
              {registeredComponentNames.length === 0 ? (
                <option value="">No hay widgets disponibles</option>
              ) : (
                <>
                  <option value="">Ninguno (genérico)</option>
                  {registeredComponentNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      </Section>

      {/* Widget Configuration */}
      {formData.component && resolveWidgetSchema(formData.component) && (
        <Section title="Configuracion del Widget" titlePrefix={<Info className="h-4 w-4 text-purple-500" />}>
          <JsonEditor
            value={formData.componentConfig ?? {}}
            onChange={handleConfigChange}
            disabled={loading}
            rows={12}
            placeholder='{ "items": [...], "columns": { "xs": 1, "sm": 2, "md": 3 } }'
            helpText="Configuracion JSON del widget (validado con el schema del componente)"
            invalidMessage="JSON invalido"
          />
          {configErrors.length > 0 && (
            <div className="mt-2 rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-xs font-medium text-red-700 mb-1">Errores de validacion del schema:</p>
              <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                {configErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Recursos Asociados */}
      <Section title="Recursos Asociados" titlePrefix={<Info className="h-4 w-4 text-blue-500" />}>
        <p className="text-xs text-gray-500 italic">
          Próximamente: asociar recursos HATEOAS al módulo para inferir sus capacidades.
        </p>
      </Section>

      {/* Actions Config Editor */}
      <ActionsConfigEditor
        actions={formData.actionsConfig || []}
        onChange={handleActionsChange}
        disabled={loading}
        moduleCode={formData.code}
        permissions={permissions}
      />

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default ModuleEditForm;
