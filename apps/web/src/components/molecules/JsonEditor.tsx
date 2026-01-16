'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface JsonEditorProps<T = unknown> {
  /**
   * The value to display in the editor (will be stringified)
   */
  value: T | undefined;
  /**
   * Callback when valid JSON is entered
   */
  onChange: (parsed: T) => void;
  /**
   * Whether the editor is disabled
   */
  disabled?: boolean;
  /**
   * Number of rows for the textarea
   */
  rows?: number;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Help text shown below the editor when JSON is valid
   */
  helpText?: string;
  /**
   * Error message shown when JSON is invalid (defaults to "JSON invalido")
   */
  invalidMessage?: string;
  /**
   * Additional CSS classes for the textarea
   */
  className?: string;
}

const baseInputClasses =
  'mt-1 block w-full rounded-md border px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 font-mono';

/**
 * JsonEditor - Molecule component
 *
 * A textarea that allows editing JSON with local state management.
 * This allows users to type invalid JSON while editing, and only
 * commits the changes when the JSON becomes valid.
 *
 * Features:
 * - Visual feedback for valid/invalid JSON
 * - Local state to allow typing without losing changes
 * - Syncs with external value changes
 *
 * @example
 * ```tsx
 * <JsonEditor
 *   value={settings}
 *   onChange={(newSettings) => setSettings(newSettings)}
 *   rows={4}
 *   helpText="Edit JSON for advanced configuration"
 * />
 * ```
 */
export function JsonEditor<T = unknown>({
  value,
  onChange,
  disabled = false,
  rows = 8,
  placeholder,
  helpText = 'Edit the JSON directly for advanced configurations',
  invalidMessage = 'JSON invalido',
  className = '',
}: JsonEditorProps<T>) {
  const [localValue, setLocalValue] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Track the last value we sent to parent to avoid unnecessary syncs
  const lastSentValue = useRef<string>(JSON.stringify(value ?? {}));

  // Sync local value only when external value changes from outside (not from our own onChange)
  useEffect(() => {
    const newStringified = JSON.stringify(value ?? {});
    // Only sync if the external value is different from what we last sent
    if (newStringified !== lastSentValue.current) {
      setLocalValue(JSON.stringify(value ?? {}, null, 2));
      setIsValid(true);
      lastSentValue.current = newStringified;
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      try {
        const parsed = JSON.parse(newValue) as T;
        setIsValid(true);
        setErrorMessage(null);
        // Track what we're sending to parent
        lastSentValue.current = JSON.stringify(parsed);
        onChange(parsed);
      } catch (error) {
        setIsValid(false);
        // Extract error message from SyntaxError
        const message =
          error instanceof SyntaxError ? error.message : 'Error de sintaxis desconocido';
        setErrorMessage(message);
        // Don't update parent - JSON is invalid, but user can keep typing
      }
    },
    [onChange]
  );

  const inputClasses = `${baseInputClasses} ${
    isValid
      ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      : 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
  } ${className}`;

  return (
    <div>
      <textarea
        value={localValue}
        onChange={handleChange}
        className={inputClasses}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
      />
      {!isValid && (
        <p className="mt-1 text-xs text-red-500">
          {invalidMessage}: {errorMessage}
        </p>
      )}
      {isValid && helpText && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
    </div>
  );
}

export default JsonEditor;
