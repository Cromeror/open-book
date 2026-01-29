'use client';

import * as icons from 'lucide-react';
import type { CapabilityPreset } from '@/lib/http-api/capability-presets-api';
import { Button, IconButton } from '@/components/atoms';
import type { ButtonVariant } from '@/components/atoms/Button';

/**
 * Action configuration for capability presets list
 */
export interface CapabilityPresetAction {
  // Icon name from lucide-react (optional)
  icon?: keyof typeof icons;
  label?: string;
  onClick: (preset: CapabilityPreset) => void;
  variant?: ButtonVariant;
  // Condition to show the action (default: always show)
  showCondition?: (preset: CapabilityPreset) => boolean;
  // Tooltip for icon-only buttons
  title?: string;
  loading?: boolean;
}

export interface CapabilityPresetsListProps {
  presets: CapabilityPreset[];
  actions: CapabilityPresetAction[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: keyof typeof icons; // lucide-react icon name
}

/**
 * CapabilityPresetsList - Organism component for displaying capability presets
 *
 * Displays a list of capability presets with configurable action buttons.
 * Actions can be icon-only or text+icon based on configuration.
 */
export function CapabilityPresetsList({
  presets,
  actions,
  loading = false,
  emptyMessage = 'No presets available',
  emptyIcon = 'Package',
}: CapabilityPresetsListProps) {
  // Get empty icon component
  const EmptyIconComponent = icons[emptyIcon] as React.ComponentType<{ className?: string }>;

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading presets...
      </div>
    );
  }

  if (presets.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-12">
        {EmptyIconComponent && <EmptyIconComponent className="h-16 w-16 mx-auto mb-4 text-gray-400" />}
        <p className="font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="rounded-lg border border-gray-200 p-4 bg-white"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Preset Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {preset.label}
                  </h3>
                  <code className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    {preset.id}
                  </code>
                  {preset.isSystem && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      System
                    </span>
                  )}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      preset.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {preset.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {preset.description && (
                  <p className="text-xs mb-2 text-gray-600">
                    {preset.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  {preset.capabilities.length}{' '}
                  {preset.capabilities.length === 1 ? 'capability' : 'capabilities'}
                </div>

                {/* Capabilities List */}
                <div className="mt-2 space-y-1">
                  {preset.capabilities.map((cap, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono px-2 py-1 rounded text-gray-600 bg-gray-50"
                    >
                      <span className="font-semibold text-blue-600">
                        {cap.method}
                      </span>{' '}
                      {cap.name} → {cap.urlPattern || '/'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {actions.map((action, idx) => {
                  // Check if action should be shown
                  const shouldShow = action.showCondition ? action.showCondition(preset) : true;
                  if (!shouldShow) return null;

                  // Validate action has icon or label
                  if (!action.icon && !action.label) {
                    console.error('CapabilityPresetAction must have either icon or label', action);
                    return null;
                  }

                  // Determine button type
                  const isIconOnly = action.icon && !action.label;

                  if (isIconOnly) {
                    return (
                      <IconButton
                        key={idx}
                        icon={action.icon!}
                        variant={action.variant}
                        onClick={() => action.onClick(preset)}
                        title={action.title || action.icon!}
                        loading={action.loading}
                        size="sm"
                      />
                    );
                  } else {
                    return (
                      <Button
                        key={idx}
                        icon={action.icon}
                        variant={action.variant}
                        onClick={() => action.onClick(preset)}
                        loading={action.loading}
                        size="sm"
                      >
                        {action.label}
                      </Button>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
