'use client';

import { useState } from 'react';
import type { ModuleAction, ModulePermission, ModuleType, ActionSettings } from './types';
import { ACTION_SETTINGS_TYPES } from './types';
import {
  DEFAULT_CRUD_ACTIONS,
  SPECIALIZED_ACTION_TEMPLATES,
  getDefaultSettingsForCode,
  getDefaultLabelForCode,
  isCrudActionCode,
} from './constants';
import { JsonEditor } from '@/components/molecules';

interface ActionsConfigEditorProps {
  actions: ModuleAction[];
  onChange: (actions: ModuleAction[]) => void;
  disabled?: boolean;
  moduleType?: ModuleType;
  moduleCode?: string;
  permissions?: ModulePermission[];
}

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-xs font-medium text-gray-600';

export function ActionsConfigEditor({
  actions,
  onChange,
  disabled,
  moduleType = 'crud',
  moduleCode,
  permissions = [],
}: ActionsConfigEditorProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Check if a permission is configured (has an action)
  const isPermissionConfigured = (permissionCode: string): boolean => {
    return actions.some((a) => a.code === permissionCode);
  };

  // Get action for a permission code
  const getActionForPermission = (permissionCode: string): ModuleAction | undefined => {
    return actions.find((a) => a.code === permissionCode);
  };

  // Toggle permission configuration
  const handleTogglePermission = (permission: ModulePermission) => {
    const existingAction = getActionForPermission(permission.code);

    if (existingAction) {
      // Remove action
      const newActions = actions.filter((a) => a.code !== permission.code);
      onChange(newActions);
      if (expandedAction === permission.code) {
        setExpandedAction(null);
      }
    } else {
      // Add action with default settings
      const isCrudCode = isCrudActionCode(permission.code);
      const settings =
        moduleType === 'crud' && isCrudCode
          ? getDefaultSettingsForCode(permission.code)
          : { type: 'generic' as const };

      const newAction: ModuleAction = {
        code: permission.code,
        label: permission.name || getDefaultLabelForCode(permission.code),
        description: permission.description || '',
        settings,
      };
      onChange([...actions, newAction]);
    }
  };

  // Find action index by code
  const findActionIndex = (code: string): number => {
    return actions.findIndex((a) => a.code === code);
  };

  const handleAddAction = () => {
    const newAction: ModuleAction = {
      code: '',
      label: '',
      description: '',
      settings: { type: 'generic' },
    };
    onChange([...actions, newAction]);
    setExpandedAction(`new-${actions.length}`);
  };

  const handleGenerateDefaultCRUD = () => {
    const existingCodes = new Set(actions.map((a) => a.code));
    const newActions = DEFAULT_CRUD_ACTIONS.filter((a) => !existingCodes.has(a.code));
    if (newActions.length > 0) {
      onChange([...actions, ...newActions]);
    }
  };

  const handleApplySpecializedTemplate = (templateKey: string) => {
    const template = SPECIALIZED_ACTION_TEMPLATES[templateKey];
    if (!template) return;

    const existingCodes = new Set(actions.map((a) => a.code));
    const newActions = template.filter((a) => !existingCodes.has(a.code));
    if (newActions.length > 0) {
      onChange([...actions, ...newActions]);
    }
  };

  const handleRemoveAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    onChange(newActions);
    setExpandedAction(null);
  };

  const handleUpdateAction = (index: number, field: keyof ModuleAction, value: unknown) => {
    const newActions = [...actions];
    const currentAction = newActions[index];
    if (!currentAction) return;
    newActions[index] = {
      code: currentAction.code,
      label: currentAction.label,
      description: currentAction.description,
      settings: currentAction.settings,
      [field]: value,
    };
    onChange(newActions);
  };

  const handleUpdateSettings = (index: number, settingsField: string, value: unknown) => {
    const newActions = [...actions];
    const currentAction = newActions[index];
    if (!currentAction) return;
    const currentSettings = currentAction.settings || {
      type: ACTION_SETTINGS_TYPES.GENERIC,
    };
    // Use type assertion since we're dynamically updating settings
    const updatedSettings = {
      ...currentSettings,
      [settingsField]: value,
    } as ActionSettings;
    newActions[index] = {
      code: currentAction.code,
      label: currentAction.label,
      description: currentAction.description,
      settings: updatedSettings,
    };
    onChange(newActions);
  };

  // Available specialized templates
  const availableTemplates = Object.keys(SPECIALIZED_ACTION_TEMPLATES);
  const hasMatchingTemplate = moduleCode && availableTemplates.includes(moduleCode);

  // Get unconfigured actions (actions that don't match any permission)
  const unconfiguredActions = actions.filter(
    (action) => !permissions.some((p) => p.code === action.code)
  );

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Configuracion de Acciones</h3>
        <div className="flex gap-2">
          {permissions.length === 0 && moduleType === 'crud' && (
            <button
              type="button"
              onClick={handleGenerateDefaultCRUD}
              disabled={disabled}
              className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
              title="Genera acciones CRUD por defecto (read, create, update, delete)"
            >
              + CRUD Default
            </button>
          )}
          {permissions.length === 0 && moduleType === 'specialized' && (
            <div className="relative group">
              <button
                type="button"
                disabled={disabled}
                className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
              >
                + Plantilla ▾
              </button>
              <div className="absolute right-0 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                <div className="py-1">
                  {availableTemplates.map((templateKey) => (
                    <button
                      key={templateKey}
                      type="button"
                      onClick={() => handleApplySpecializedTemplate(templateKey)}
                      className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100"
                    >
                      {templateKey.charAt(0).toUpperCase() + templateKey.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {hasMatchingTemplate && moduleType !== 'specialized' && (
            <button
              type="button"
              onClick={() => handleApplySpecializedTemplate(moduleCode!)}
              disabled={disabled}
              className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
              title={`Aplica plantilla predefinida para ${moduleCode}`}
            >
              + Plantilla {moduleCode}
            </button>
          )}
          {permissions.length === 0 && (
            <button
              type="button"
              onClick={handleAddAction}
              disabled={disabled}
              className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
            >
              + Agregar
            </button>
          )}
        </div>
      </div>

      {/* Permissions-based configuration */}
      {permissions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">
            Seleccione los permisos para configurar sus acciones:
          </p>
          <div className="space-y-2">
            {permissions.map((permission) => {
              const isConfigured = isPermissionConfigured(permission.code);
              const action = getActionForPermission(permission.code);
              const actionIndex = findActionIndex(permission.code);
              const isExpanded = expandedAction === permission.code;
              const isCrudCode = isCrudActionCode(permission.code);

              return (
                <div
                  key={permission.id}
                  className={`rounded-lg border overflow-hidden ${
                    isConfigured ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(permission)}
                        disabled={disabled}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isConfigured ? 'bg-blue-600' : 'bg-gray-200'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isConfigured ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-medium text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            {permission.code}
                          </code>
                          <span className="text-sm font-medium text-gray-900">
                            {permission.name}
                          </span>
                          {moduleType === 'crud' && isCrudCode && (
                            <span className="text-xs text-gray-400">(CRUD)</span>
                          )}
                        </div>
                        {permission.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{permission.description}</p>
                        )}
                      </div>
                    </div>
                    {isConfigured && action && (
                      <button
                        type="button"
                        onClick={() => setExpandedAction(isExpanded ? null : permission.code)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Configurar
                        <svg
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Expanded configuration */}
                  {isExpanded && action && actionIndex >= 0 && (
                    <div className="px-3 py-3 border-t border-gray-200 bg-white space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClasses}>Etiqueta</label>
                          <input
                            type="text"
                            value={action.label}
                            onChange={(e) => handleUpdateAction(actionIndex, 'label', e.target.value)}
                            className={inputClasses}
                            placeholder="ej: Ver, Crear, Editar"
                            disabled={disabled}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Tipo de Settings</label>
                          <select
                            value={action.settings?.type || 'generic'}
                            onChange={(e) => handleUpdateSettings(actionIndex, 'type', e.target.value)}
                            className={inputClasses}
                            disabled={disabled || (moduleType === 'crud' && isCrudCode)}
                          >
                            <option value="read">Read (Lista/Detalle)</option>
                            <option value="create">Create (Formulario)</option>
                            <option value="update">Update (Formulario)</option>
                            <option value="delete">Delete (Eliminar)</option>
                            <option value="generic">Generic (Especializado)</option>
                          </select>
                          {moduleType === 'crud' && isCrudCode && (
                            <p className="mt-1 text-xs text-gray-400">Tipo fijo para acciones CRUD</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className={labelClasses}>Descripcion</label>
                          <input
                            type="text"
                            value={action.description || ''}
                            onChange={(e) =>
                              handleUpdateAction(actionIndex, 'description', e.target.value)
                            }
                            className={inputClasses}
                            placeholder="Descripcion de la accion"
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      {/* Type-specific settings */}
                      {action.settings?.type === 'delete' && (
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Configuracion de Eliminacion
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClasses}>Soft Delete</label>
                              <select
                                value={action.settings?.soft ? 'true' : 'false'}
                                onChange={(e) =>
                                  handleUpdateSettings(actionIndex, 'soft', e.target.value === 'true')
                                }
                                className={inputClasses}
                                disabled={disabled}
                              >
                                <option value="true">Si (logico)</option>
                                <option value="false">No (permanente)</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className={labelClasses}>Mensaje de Confirmacion</label>
                              <input
                                type="text"
                                value={action.settings?.confirmation || ''}
                                onChange={(e) =>
                                  handleUpdateSettings(actionIndex, 'confirmation', e.target.value)
                                }
                                className={inputClasses}
                                placeholder="¿Esta seguro de eliminar este registro?"
                                disabled={disabled}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* JSON Editor for advanced settings */}
                      <div className="border-t border-gray-100 pt-3">
                        <label className={labelClasses}>Settings (JSON avanzado)</label>
                        <JsonEditor<ActionSettings>
                          value={action.settings}
                          onChange={(parsed) => handleUpdateAction(actionIndex, 'settings', parsed)}
                          disabled={disabled}
                          rows={4}
                          helpText="Edita el JSON directamente para configuraciones avanzadas"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legacy actions (not tied to permissions) */}
      {(permissions.length === 0 || unconfiguredActions.length > 0) && (
        <div>
          {permissions.length > 0 && unconfiguredActions.length > 0 && (
            <p className="text-xs text-amber-600 mb-2">
              Acciones sin permiso asociado (considere eliminarlas o crear el permiso):
            </p>
          )}
          {(permissions.length === 0 ? actions : unconfiguredActions).length === 0 ? (
            permissions.length === 0 && (
              <p className="text-xs text-gray-500 italic">
                No hay acciones configuradas. Use los botones de arriba para agregar acciones.
              </p>
            )
          ) : (
            <div className="space-y-2">
              {(permissions.length === 0 ? actions : unconfiguredActions).map((action, idx) => {
                const index =
                  permissions.length === 0 ? idx : actions.findIndex((a) => a.code === action.code);
                const actionKey = action.code || `new-${index}`;
                const isExpanded = expandedAction === actionKey;

                return (
                  <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setExpandedAction(isExpanded ? null : actionKey)}
                        className="flex items-center gap-2 hover:text-blue-600"
                      >
                        <code className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {action.code || '(nuevo)'}
                        </code>
                        <span className="text-sm text-gray-700">
                          {action.label || '(sin etiqueta)'}
                        </span>
                        <svg
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAction(index)}
                        disabled={disabled}
                        className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-3 py-3 border-t border-gray-200 bg-white space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClasses}>Codigo</label>
                            <input
                              type="text"
                              value={action.code}
                              onChange={(e) =>
                                handleUpdateAction(
                                  index,
                                  'code',
                                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                                )
                              }
                              className={inputClasses}
                              placeholder="ej: read, create, update, delete"
                              disabled={disabled}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>Etiqueta</label>
                            <input
                              type="text"
                              value={action.label}
                              onChange={(e) => handleUpdateAction(index, 'label', e.target.value)}
                              className={inputClasses}
                              placeholder="ej: Ver, Crear, Editar"
                              disabled={disabled}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className={labelClasses}>Descripcion</label>
                            <input
                              type="text"
                              value={action.description || ''}
                              onChange={(e) =>
                                handleUpdateAction(index, 'description', e.target.value)
                              }
                              className={inputClasses}
                              placeholder="Descripcion de la accion"
                              disabled={disabled}
                            />
                          </div>
                        </div>

                        {/* Settings */}
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Configuracion</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClasses}>Tipo</label>
                              <select
                                value={action.settings?.type || 'generic'}
                                onChange={(e) =>
                                  handleUpdateSettings(index, 'type', e.target.value)
                                }
                                className={inputClasses}
                                disabled={disabled}
                              >
                                <option value="read">Read (Lista/Detalle)</option>
                                <option value="create">Create (Formulario)</option>
                                <option value="update">Update (Formulario)</option>
                                <option value="delete">Delete (Eliminar)</option>
                                <option value="generic">Generic (Especializado)</option>
                              </select>
                            </div>

                            {action.settings?.type === 'delete' && (
                              <>
                                <div>
                                  <label className={labelClasses}>Soft Delete</label>
                                  <select
                                    value={action.settings?.soft ? 'true' : 'false'}
                                    onChange={(e) =>
                                      handleUpdateSettings(
                                        index,
                                        'soft',
                                        e.target.value === 'true'
                                      )
                                    }
                                    className={inputClasses}
                                    disabled={disabled}
                                  >
                                    <option value="true">Si (logico)</option>
                                    <option value="false">No (permanente)</option>
                                  </select>
                                </div>
                                <div className="col-span-2">
                                  <label className={labelClasses}>Mensaje de Confirmacion</label>
                                  <input
                                    type="text"
                                    value={action.settings?.confirmation || ''}
                                    onChange={(e) =>
                                      handleUpdateSettings(index, 'confirmation', e.target.value)
                                    }
                                    className={inputClasses}
                                    placeholder="¿Esta seguro de eliminar este registro?"
                                    disabled={disabled}
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          {/* JSON Editor for advanced settings */}
                          <div className="mt-3">
                            <label className={labelClasses}>Settings (JSON avanzado)</label>
                            <JsonEditor<ActionSettings>
                              value={action.settings}
                              onChange={(parsed) => handleUpdateAction(index, 'settings', parsed)}
                              disabled={disabled}
                              rows={4}
                              helpText="Edita el JSON directamente para configuraciones avanzadas"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActionsConfigEditor;
