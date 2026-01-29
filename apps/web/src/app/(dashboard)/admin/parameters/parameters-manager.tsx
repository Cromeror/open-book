'use client';

import { useState, useEffect } from 'react';

/**
 * System setting type
 */
interface SystemSetting {
  id: string;
  key: string;
  value: string;
  valueType: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  label: string;
  description?: string;
  isSensitive: boolean;
  isActive: boolean;
  order: number;
  validation?: Record<string, unknown>;
  defaultValue?: string;
}

/**
 * Settings grouped by category
 */
interface SettingsByCategory {
  category: string;
  label: string;
  settings: SystemSetting[];
}

/**
 * Category icons for display
 */
const CATEGORY_ICONS: Record<string, string> = {
  general: '⚙️',
  variables: '🔧',
  security: '🔒',
  audit: '📝',
  limits: '📊',
};

/**
 * Mock data for settings
 */
const MOCK_SETTINGS: SettingsByCategory[] = [
  {
    category: 'general',
    label: 'General',
    settings: [
      {
        id: '1',
        key: 'app_name',
        value: 'OpenBook',
        valueType: 'string',
        category: 'general',
        label: 'Nombre de la aplicacion',
        description: 'Nombre mostrado en la interfaz',
        isSensitive: false,
        isActive: true,
        order: 1,
        defaultValue: 'OpenBook',
      },
      {
        id: '2',
        key: 'timezone',
        value: 'America/Bogota',
        valueType: 'string',
        category: 'general',
        label: 'Zona horaria',
        description: 'Zona horaria del sistema',
        isSensitive: false,
        isActive: true,
        order: 2,
        defaultValue: 'America/Bogota',
      },
      {
        id: '3',
        key: 'currency_code',
        value: 'COP',
        valueType: 'string',
        category: 'general',
        label: 'Codigo de moneda',
        description: 'Codigo ISO de la moneda (ej: COP, USD)',
        isSensitive: false,
        isActive: true,
        order: 3,
        defaultValue: 'COP',
      },
      {
        id: '4',
        key: 'date_format',
        value: 'DD/MM/YYYY',
        valueType: 'string',
        category: 'general',
        label: 'Formato de fecha',
        description: 'Formato para mostrar fechas',
        isSensitive: false,
        isActive: true,
        order: 4,
        defaultValue: 'DD/MM/YYYY',
      },
    ],
  },
  {
    category: 'variables',
    label: 'Configuración de variables',
    settings: [
      {
        id: '5',
        key: 'api_base_url',
        value: 'https://api.openbook.com',
        valueType: 'string',
        category: 'variables',
        label: 'URL base de la API',
        description: 'URL base para las peticiones a la API',
        isSensitive: false,
        isActive: true,
        order: 1,
        defaultValue: 'https://api.openbook.com',
      },
      {
        id: '6',
        key: 'environment',
        value: 'production',
        valueType: 'string',
        category: 'variables',
        label: 'Entorno',
        description: 'Entorno de ejecución del sistema',
        isSensitive: false,
        isActive: true,
        order: 2,
        defaultValue: 'production',
      },
      {
        id: '7',
        key: 'debug_mode',
        value: 'false',
        valueType: 'boolean',
        category: 'variables',
        label: 'Modo debug',
        description: 'Habilitar logs detallados para desarrollo',
        isSensitive: false,
        isActive: true,
        order: 3,
        defaultValue: 'false',
      },
      {
        id: '8',
        key: 'maintenance_mode',
        value: 'false',
        valueType: 'boolean',
        category: 'variables',
        label: 'Modo mantenimiento',
        description: 'Activar página de mantenimiento para usuarios',
        isSensitive: false,
        isActive: true,
        order: 4,
        defaultValue: 'false',
      },
    ],
  },
  {
    category: 'security',
    label: 'Seguridad',
    settings: [
      {
        id: '12',
        key: 'session_timeout_minutes',
        value: '60',
        valueType: 'number',
        category: 'security',
        label: 'Timeout de sesion (minutos)',
        description: 'Tiempo de inactividad antes de cerrar sesion',
        isSensitive: false,
        isActive: true,
        order: 1,
        validation: { min: 5, max: 1440 },
        defaultValue: '60',
      },
      {
        id: '13',
        key: 'max_login_attempts',
        value: '5',
        valueType: 'number',
        category: 'security',
        label: 'Intentos maximos de login',
        description: 'Intentos fallidos antes de bloquear cuenta',
        isSensitive: false,
        isActive: true,
        order: 2,
        validation: { min: 3, max: 10 },
        defaultValue: '5',
      },
      {
        id: '14',
        key: 'password_min_length',
        value: '8',
        valueType: 'number',
        category: 'security',
        label: 'Longitud minima de contrasena',
        description: 'Caracteres minimos para contrasenas',
        isSensitive: false,
        isActive: true,
        order: 3,
        validation: { min: 6, max: 32 },
        defaultValue: '8',
      },
    ],
  },
  {
    category: 'audit',
    label: 'Auditoria',
    settings: [
      {
        id: '15',
        key: 'audit_retention_days',
        value: '365',
        valueType: 'number',
        category: 'audit',
        label: 'Dias de retencion de auditoria',
        description: 'Dias que se conservan los logs de auditoria',
        isSensitive: false,
        isActive: true,
        order: 1,
        validation: { min: 30, max: 3650 },
        defaultValue: '365',
      },
    ],
  },
  {
    category: 'limits',
    label: 'Limites',
    settings: [
      {
        id: '16',
        key: 'max_file_size_mb',
        value: '10',
        valueType: 'number',
        category: 'limits',
        label: 'Tamano maximo de archivo (MB)',
        description: 'Tamano maximo permitido para archivos adjuntos',
        isSensitive: false,
        isActive: true,
        order: 1,
        validation: { min: 1, max: 100 },
        defaultValue: '10',
      },
      {
        id: '17',
        key: 'max_properties_per_condominium',
        value: '500',
        valueType: 'number',
        category: 'limits',
        label: 'Propiedades maximas por condominio',
        description: 'Limite de propiedades que puede tener un condominio',
        isSensitive: false,
        isActive: true,
        order: 2,
        validation: { min: 1, max: 10000 },
        defaultValue: '500',
      },
    ],
  },
];

export function SettingsManager() {
  const [settingsByCategory, setSettingsByCategory] = useState<SettingsByCategory[]>(MOCK_SETTINGS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    MOCK_SETTINGS[0]?.category ?? null
  );
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  const handleStartEdit = (setting: SystemSetting) => {
    setEditingSettingId(setting.id);
    setEditValue(setting.value);
  };

  const handleCancelEdit = () => {
    setEditingSettingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (setting: SystemSetting) => {
    // Update local state (mock)
    setSettingsByCategory((prev) =>
      prev.map((group) => ({
        ...group,
        settings: group.settings.map((s) =>
          s.id === setting.id ? { ...s, value: editValue } : s
        ),
      }))
    );

    setEditingSettingId(null);
    setEditValue('');
    setSuccessMessage(`Configuracion "${setting.label}" actualizada`);
  };

  const handleResetToDefault = (setting: SystemSetting) => {
    if (!setting.defaultValue) return;

    // Update local state (mock)
    setSettingsByCategory((prev) =>
      prev.map((group) => ({
        ...group,
        settings: group.settings.map((s) =>
          s.id === setting.id ? { ...s, value: setting.defaultValue! } : s
        ),
      }))
    );

    setSuccessMessage(`Configuracion "${setting.label}" restaurada`);
  };

  const renderValueInput = (setting: SystemSetting) => {
    const isEditing = editingSettingId === setting.id;

    if (setting.valueType === 'boolean') {
      return (
        <select
          value={isEditing ? editValue : setting.value}
          onChange={(e) => setEditValue(e.target.value)}
          disabled={!isEditing}
          className={`rounded border px-2 py-1 text-sm ${
            isEditing
              ? 'border-blue-300 bg-white'
              : 'border-gray-200 bg-gray-50'
          } disabled:opacity-70`}
        >
          <option value="true">Si</option>
          <option value="false">No</option>
        </select>
      );
    }

    if (setting.valueType === 'number') {
      const validation = setting.validation as { min?: number; max?: number } | undefined;
      return (
        <input
          type="number"
          value={isEditing ? editValue : setting.value}
          onChange={(e) => setEditValue(e.target.value)}
          disabled={!isEditing}
          min={validation?.min}
          max={validation?.max}
          className={`rounded border px-2 py-1 text-sm w-32 ${
            isEditing
              ? 'border-blue-300 bg-white'
              : 'border-gray-200 bg-gray-50'
          } disabled:opacity-70`}
        />
      );
    }

    if (setting.valueType === 'json') {
      return (
        <textarea
          value={isEditing ? editValue : setting.value}
          onChange={(e) => setEditValue(e.target.value)}
          disabled={!isEditing}
          rows={3}
          className={`rounded border px-2 py-1 text-sm font-mono w-full ${
            isEditing
              ? 'border-blue-300 bg-white'
              : 'border-gray-200 bg-gray-50'
          } disabled:opacity-70`}
        />
      );
    }

    // string (default)
    return (
      <input
        type={setting.isSensitive ? 'password' : 'text'}
        value={isEditing ? editValue : setting.value}
        onChange={(e) => setEditValue(e.target.value)}
        disabled={!isEditing}
        className={`rounded border px-2 py-1 text-sm w-full max-w-xs ${
          isEditing
            ? 'border-blue-300 bg-white'
            : 'border-gray-200 bg-gray-50'
        } disabled:opacity-70`}
      />
    );
  };

  const getValueTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      string: 'Texto',
      number: 'Numero',
      boolean: 'Si/No',
      json: 'JSON',
    };
    return labels[type] || type;
  };

  const selectedGroup = settingsByCategory.find((g) => g.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 px-4 pt-4">
          <div className="flex overflow-x-auto">
            <div className="flex space-x-1" role="tablist">
              {settingsByCategory.map((group) => (
                <button
                  key={group.category}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === group.category}
                  onClick={() => setSelectedCategory(group.category)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    selectedCategory === group.category
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{CATEGORY_ICONS[group.category] || '📁'}</span>
                  <span>{group.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {group.settings.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div role="tabpanel">

          {successMessage && (
            <div className="m-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {!selectedGroup ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Selecciona una categoria para ver sus configuraciones
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-4">
                {selectedGroup.settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">{setting.label}</h3>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                            {getValueTypeLabel(setting.valueType)}
                          </span>
                          {setting.isSensitive && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                              Sensible
                            </span>
                          )}
                        </div>
                        {setting.description && (
                          <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-gray-400 bg-gray-50 px-1 rounded">
                            {setting.key}
                          </code>
                          {setting.validation && (
                            <span className="text-xs text-gray-400">
                              {(setting.validation as { min?: number; max?: number }).min !== undefined &&
                                `min: ${(setting.validation as { min?: number }).min}`}
                              {(setting.validation as { min?: number; max?: number }).min !== undefined &&
                                (setting.validation as { min?: number; max?: number }).max !== undefined &&
                                ', '}
                              {(setting.validation as { min?: number; max?: number }).max !== undefined &&
                                `max: ${(setting.validation as { max?: number }).max}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {renderValueInput(setting)}
                        </div>

                        <div className="flex gap-2">
                          {editingSettingId === setting.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(setting)}
                                className="rounded px-3 py-1 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="rounded px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(setting)}
                                className="rounded px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                              >
                                Editar
                              </button>
                              {setting.defaultValue && setting.value !== setting.defaultValue && (
                                <button
                                  type="button"
                                  onClick={() => handleResetToDefault(setting)}
                                  className="rounded px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  title={`Restaurar a: ${setting.defaultValue}`}
                                >
                                  Restaurar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
