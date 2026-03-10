'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Modal - Generic modal shell (atom)
 *
 * Provides backdrop, centering, escape key handling, click-outside dismissal,
 * and focus trapping. Renders children as the modal body.
 *
 * @example
 * <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Member">
 *   <p>Custom content here</p>
 * </Modal>
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when the modal should close (escape, backdrop click, close button) */
  onClose: () => void;
  /** Modal title displayed in the header */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Modal width */
  size?: ModalSize;
  /** Prevent closing (disables escape, backdrop click, and close button) */
  preventClose?: boolean;
  /** Modal body content */
  children: React.ReactNode;
  /** Optional footer content (buttons, actions) */
  footer?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl min-w-[50vw]',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  preventClose = false,
  children,
  footer,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || preventClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, preventClose, onClose]);

  // Focus first focusable element on open
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelector<HTMLElement>(
      'input, select, textarea, button:not([disabled])',
    );
    focusable?.focus();
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !preventClose) {
        onClose();
      }
    },
    [preventClose, onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className={`relative w-full ${sizeClasses[size]} rounded-lg bg-white shadow-xl`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div>
              <h3
                className="text-lg font-semibold text-gray-900"
                id="modal-title"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={preventClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
