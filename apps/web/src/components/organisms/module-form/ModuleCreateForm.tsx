'use client';

import { useState, useCallback } from 'react';
import { ICON_MAP, AVAILABLE_ICONS } from '@/lib/constants';
import type { ModuleCreateFormProps, ModuleFormData, ModuleType, ValidationError } from './types';
import { validateModuleForm, normalizeCode, normalizeTags } from './validation';
import { ActionsConfigEditor } from './ActionsConfigEditor';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-700';

/**
 * ModuleCreateForm - Organism component
 *
 * Form for creating new modules.
 * Performs client-side validation and emits onSubmit with form data.
 * Does not make create API calls directly.
 */
export function ModuleCreateForm({
  onSubmit,
  onCancel,
  loading = false,
  initialOrder = 0,
}: ModuleCreateFormProps) {
  const [formData, setFormData] = useState<ModuleFormData>({
    code: '',
    name: '',
    description: '',
    icon: '',
    type: 'crud',
    entity: '',
    endpoint: '',
    component: '',
    navConfig: { path: '', order: initialOrder },
    actionsConfig: [],
    order: initialOrder,
    tags: [],
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [tagsInput, setTagsInput] = useState('');

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  const handleFieldChange = useCallback(
    <K extends keyof ModuleFormData>(field: K, value: ModuleFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      const normalized = normalizeCode(value);
      handleFieldChange('code', normalized);
    },
    [handleFieldChange]
  );

  const handleTagsChange = useCallback(
    (value: string) => {
      setTagsInput(value);
      const tags = normalizeTags(value);
      handleFieldChange('tags', tags);
    },
    [handleFieldChange]
  );

  const handleNavPathChange = useCallback(
    (path: string) => {
      setFormData((prev) => ({
        ...prev,
        navConfig: { ...prev.navConfig, path, order: prev.navConfig?.order ?? 0 },
      }));
      setErrors((prev) => prev.filter((e) => e.field !== 'navConfig.path'));
    },
    []
  );

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

  const isFormValid = formData.code.trim() !== '' && formData.name.trim() !== '';

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Code (required) */}
        <div>
          <label className={labelClasses}>
            Codigo <span className="text-red-500">*</span>
          </label>
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
            <p className="mt-1 text-xs text-gray-500">
              Solo letras minusculas, numeros y guion bajo
            </p>
          )}
        </div>

        {/* Name (required) */}
        <div>
          <label className={labelClasses}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={`${inputClasses} ${getFieldError('name') ? 'border-red-500' : ''}`}
            placeholder="ej: Objetivos de Recaudo"
            disabled={loading}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('name')}</p>
          )}
        </div>

        {/* Icon */}
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

        {/* Type */}
        <div>
          <label className={labelClasses}>Tipo</label>
          <select
            value={formData.type}
            onChange={(e) => handleFieldChange('type', e.target.value as ModuleType)}
            className={inputClasses}
            disabled={loading}
          >
            <option value="crud">CRUD</option>
            <option value="specialized">Especializado</option>
          </select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className={labelClasses}>Descripcion</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className={`${inputClasses} ${getFieldError('description') ? 'border-red-500' : ''}`}
            rows={2}
            disabled={loading}
          />
          {getFieldError('description') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('description')}</p>
          )}
        </div>

        {/* Tags */}
        <div className="col-span-2">
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

        {/* Entity (for CRUD) */}
        {formData.type === 'crud' && (
          <>
            <div>
              <label className={labelClasses}>Entidad</label>
              <input
                type="text"
                value={formData.entity || ''}
                onChange={(e) => handleFieldChange('entity', e.target.value)}
                className={`${inputClasses} ${getFieldError('entity') ? 'border-red-500' : ''}`}
                placeholder="Ej: Goal"
                disabled={loading}
              />
              {getFieldError('entity') && (
                <p className="mt-1 text-xs text-red-500">{getFieldError('entity')}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>Endpoint</label>
              <input
                type="text"
                value={formData.endpoint || ''}
                onChange={(e) => handleFieldChange('endpoint', e.target.value)}
                className={`${inputClasses} ${getFieldError('endpoint') ? 'border-red-500' : ''}`}
                placeholder="Ej: /api/goals"
                disabled={loading}
              />
              {getFieldError('endpoint') && (
                <p className="mt-1 text-xs text-red-500">{getFieldError('endpoint')}</p>
              )}
            </div>
          </>
        )}

        {/* Component (for specialized) */}
        {formData.type === 'specialized' && (
          <div className="col-span-2">
            <label className={labelClasses}>Componente</label>
            <input
              type="text"
              value={formData.component || ''}
              onChange={(e) => handleFieldChange('component', e.target.value)}
              className={`${inputClasses} ${getFieldError('component') ? 'border-red-500' : ''}`}
              placeholder="Ej: ReportsModule"
              disabled={loading}
            />
            {getFieldError('component') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('component')}</p>
            )}
          </div>
        )}

        {/* Nav Config */}
        <div>
          <label className={labelClasses}>Ruta de Navegacion</label>
          <input
            type="text"
            value={formData.navConfig?.path || ''}
            onChange={(e) => handleNavPathChange(e.target.value)}
            className={`${inputClasses} ${getFieldError('navConfig.path') ? 'border-red-500' : ''}`}
            placeholder="Ej: /goals"
            disabled={loading}
          />
          {getFieldError('navConfig.path') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('navConfig.path')}</p>
          )}
        </div>
        <div>
          <label className={labelClasses}>Orden</label>
          <input
            type="number"
            value={formData.order ?? 0}
            onChange={(e) => handleFieldChange('order', parseInt(e.target.value, 10) || 0)}
            className={`${inputClasses} ${getFieldError('order') ? 'border-red-500' : ''}`}
            min={0}
            disabled={loading}
          />
          {getFieldError('order') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('order')}</p>
          )}
        </div>
      </div>

      {/* Actions Config Editor */}
      <ActionsConfigEditor
        actions={formData.actionsConfig || []}
        onChange={handleActionsChange}
        disabled={loading}
        moduleType={formData.type}
        moduleCode={formData.code}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Modulo'}
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

export default ModuleCreateForm;
