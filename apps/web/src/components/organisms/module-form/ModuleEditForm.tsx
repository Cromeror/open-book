'use client';

import { useState, useCallback, useEffect } from 'react';
import { Info } from 'lucide-react';
import { ICON_MAP, AVAILABLE_ICONS } from '@/lib/constants';
import { Section } from '@/components/molecules';
import type { ModuleEditFormProps, ModuleFormData, ValidationError } from './types';
import { validateModuleForm, normalizeCode, normalizeTags } from './validation';
import { ActionsConfigEditor } from './ActionsConfigEditor';

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

  const handleActionsChange = useCallback((actions: ModuleFormData['actionsConfig']) => {
    setFormData((prev) => ({ ...prev, actionsConfig: actions }));
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateModuleForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
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
