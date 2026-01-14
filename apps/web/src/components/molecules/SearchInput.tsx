'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Initial search value */
  initialValue?: string;
  /** Callback when search value changes (debounced) */
  onSearch: (value: string) => void;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SearchInput - Generic reusable search component
 *
 * Features:
 * - Debounced search to avoid excessive API calls
 * - Clear button when there's input
 * - Search icon
 * - Configurable size variants
 */
export function SearchInput({
  placeholder = 'Buscar...',
  initialValue = '',
  onSearch,
  debounceMs = 300,
  disabled = false,
  className = '',
  size = 'md',
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with initialValue when it changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'h-8 text-xs pl-8 pr-8',
    md: 'h-10 text-sm pl-10 pr-10',
    lg: 'h-12 text-base pl-12 pr-12',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4 left-2',
    md: 'h-5 w-5 left-3',
    lg: 'h-6 w-6 left-3',
  };

  const clearButtonClasses = {
    sm: 'right-2',
    md: 'right-3',
    lg: 'right-3',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <svg
        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${iconSizeClasses[size]}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full rounded-md border border-gray-300 bg-white
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${sizeClasses[size]}
        `}
      />

      {/* Clear Button */}
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${clearButtonClasses[size]}`}
          aria-label="Limpiar busqueda"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchInput;
