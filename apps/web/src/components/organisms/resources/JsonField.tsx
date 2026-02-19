import { useMemo, useCallback } from 'react';
import { AlertCircle, CheckCircle2, AlignLeft } from 'lucide-react';

function formatJson(value: string): string | null {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return null;
  }
}

export interface JsonFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validate: (json: string) => string | null;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
}

export function JsonField({
  label,
  value,
  onChange,
  validate,
  disabled = false,
  rows = 4,
  placeholder,
}: JsonFieldProps) {
  const error = useMemo(() => validate(value), [value, validate]);
  const hasContent = !!(value && value.trim());

  const handleFormat = useCallback(() => {
    const formatted = formatJson(value);
    if (formatted) onChange(formatted);
  }, [value, onChange]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1.5">
          {hasContent && (
            <button
              type="button"
              onClick={handleFormat}
              disabled={disabled || !!error}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Formatear JSON"
            >
              <AlignLeft className="h-3 w-3" />
              Formatear
            </button>
          )}
          {hasContent && (
            error
              ? <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              : <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm font-mono text-xs focus:outline-none focus:ring-1 disabled:bg-gray-100 ${
          hasContent && error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : hasContent && !error
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        }`}
        placeholder={placeholder}
      />
      {hasContent && error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
