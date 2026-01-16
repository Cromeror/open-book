'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';

export interface Condominium {
  id: string;
  name: string;
}

export interface CondominiumSelectorProps {
  /** List of condominiums the user can manage */
  condominiums: Condominium[];
  /** Currently selected condominium */
  selectedCondominium: Condominium | null;
  /** Callback when a condominium is selected */
  onSelect: (condominium: Condominium) => void;
  /** Label shown above the selector (e.g., "MANAGING") */
  label?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * CondominiumSelector - Dropdown selector for switching between condominiums
 * Receives data via props and emits selection events
 */
export function CondominiumSelector({
  condominiums,
  selectedCondominium,
  onSelect,
  label = 'ADMINISTRANDO',
  disabled = false,
}: CondominiumSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!disabled && condominiums.length > 0) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled, condominiums.length]);

  const handleSelect = useCallback(
    (condominium: Condominium) => {
      onSelect(condominium);
      setIsOpen(false);
    },
    [onSelect]
  );

  const hasMultipleCondominiums = condominiums.length > 1;
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;

  return (
    <div ref={containerRef} className="relative">
      {/* Selector button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || condominiums.length === 0}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
          text-left transition-colors duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${hasMultipleCondominiums && !disabled ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}
          ${isOpen ? 'bg-gray-100' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {selectedCondominium?.name || 'Sin seleccionar'}
          </p>
        </div>
        {hasMultipleCondominiums && (
          <ChevronIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && hasMultipleCondominiums && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
        >
          {condominiums.map((condominium) => {
            const isSelected = selectedCondominium?.id === condominium.id;
            return (
              <button
                key={condominium.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(condominium)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left
                  transition-colors duration-150
                  ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <div
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                  `}
                >
                  <Building2
                    className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}
                  />
                </div>
                <span className="text-sm font-medium truncate">
                  {condominium.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CondominiumSelector;
