'use client';

import { useState, useEffect } from 'react';

/**
 * System setting type
 */
export interface SystemSetting {
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

interface SettingsListProps {
  settings: SystemSetting[];
}

export function SettingsList({ settings }: SettingsListProps) {
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<SystemSetting[]>(settings);

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
    setLocalSettings((prev) =>
      prev.map((s) => (s.id === setting.id ? { ...s, value: editValue } : s))
    );

    setEditingSettingId(null);
    setEditValue('');
    setSuccessMessage(`Configuración "${setting.label}" actualizada`);
  };

  const handleResetToDefault = (setting: SystemSetting) => {
    if (!setting.defaultValue) return;

    // Update local state (mock)
    setLocalSettings((prev) =>
      prev.map((s) => (s.id === setting.id ? { ...s, value: setting.defaultValue! } : s))
    );

    setSuccessMessage(`Configuración "${setting.label}" restaurada`);
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
            isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'
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
            isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'
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
            isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'
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
          isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'
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

  return (
    <div>
      {successMessage && (
        <div className="m-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="p-4">
        <div className="space-y-4">
          {localSettings.map((setting) => (
            <div key={setting.id} className="rounded-lg border border-gray-200 p-4">
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
                  <div className="flex items-center gap-2">{renderValueInput(setting)}</div>

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
    </div>
  );
}
