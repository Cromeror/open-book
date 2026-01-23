'use client';

import { Resource, ResourceScope } from '@/types/resources';
import { CheckCircleIcon, XCircleIcon, EditIcon, TrashIcon, PowerIcon } from 'lucide-react';
import { UrlPreview } from './UrlPreview';

export interface ResourceDetailProps {
  resource: Resource;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  loading?: boolean;
}

/**
 * ResourceDetail - Organism component
 *
 * Read-only view of a resource with action buttons.
 * Shows all resource properties including capabilities and URL preview.
 */
export function ResourceDetail({
  resource,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}: ResourceDetailProps) {
  const getScopeBadge = (scope: ResourceScope) => {
    if (scope === 'global') {
      return <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Global</span>;
    }
    return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Condominium</span>;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircleIcon className="h-3 w-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        <XCircleIcon className="h-3 w-3" />
        Inactive
      </span>
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{resource.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              <code className="bg-gray-100 px-1.5 py-0.5 rounded">{resource.code}</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getScopeBadge(resource.scope)}
            {getStatusBadge(resource.isActive)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </button>
          )}
          {onToggleStatus && (
            <button
              type="button"
              onClick={onToggleStatus}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <PowerIcon className="h-4 w-4" />
              {resource.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Code</dt>
            <dd className="mt-1 text-gray-900">
              <code className="bg-gray-100 px-1.5 py-0.5 rounded">{resource.code}</code>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Name</dt>
            <dd className="mt-1 text-gray-900">{resource.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Scope</dt>
            <dd className="mt-1">{getScopeBadge(resource.scope)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Status</dt>
            <dd className="mt-1">{getStatusBadge(resource.isActive)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-medium text-gray-700">Base URL</dt>
            <dd className="mt-1 text-gray-900">
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{resource.baseUrl}</code>
            </dd>
          </div>
        </dl>
      </div>

      {/* Capabilities */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Capabilities ({resource.capabilities.length})
        </h3>
        {resource.capabilities.length === 0 ? (
          <p className="text-sm text-gray-500">No capabilities defined</p>
        ) : (
          <div className="space-y-2">
            {resource.capabilities.map((capability, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{capability.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          capability.method === 'GET'
                            ? 'bg-green-100 text-green-700'
                            : capability.method === 'POST'
                              ? 'bg-blue-100 text-blue-700'
                              : capability.method === 'PATCH'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {capability.method}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">URL Pattern:</span>{' '}
                      <code className="bg-white px-1 py-0.5 rounded border">
                        {capability.urlPattern || '(empty)'}
                      </code>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Permission:</span>{' '}
                      <code className="bg-white px-1 py-0.5 rounded border">
                        {capability.permission || `${resource.code}:${capability.name} (default)`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* URL Preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">URL Preview</h3>
        <UrlPreview baseUrl={resource.baseUrl} capabilities={resource.capabilities} />
      </div>

      {/* Metadata */}
      <div className="border-t pt-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Metadata</h3>
        <dl className="grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div>
            <dt className="font-medium">Created At</dt>
            <dd className="mt-0.5">{new Date(resource.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-medium">Updated At</dt>
            <dd className="mt-0.5">{new Date(resource.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default ResourceDetail;
