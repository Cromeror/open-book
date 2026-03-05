'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  ModuleWithActionsResponse,
  ModuleResourceWithActionsResponse,
  ModuleHttpMethodWithConfig,
  ModuleActionConfig,
  ResourceUiConfig,
  HateoasDataItem,
  ListUiConfig,
  DetailUiConfig,
  FormUiConfig,
} from '@/lib/types/modules';
import { isListUiConfig } from '@/lib/types/modules';
import { ModuleHeader } from './ModuleHeader';
import { GenericList } from './GenericList';
import { GenericDetail } from './GenericDetail';
import { GenericForm } from './GenericForm';

export interface ModuleProps {
  moduleCode: string;
  metadata: ModuleWithActionsResponse;
}

/** A resolved action tied to its parent resource */
interface ResolvedAction {
  resource: ModuleResourceWithActionsResponse;
  method: ModuleHttpMethodWithConfig;
  action: ModuleActionConfig;
  uiConfig: ResourceUiConfig;
}

/**
 * Extract all actions from the module metadata, preserving resource order.
 */
function extractActions(metadata: ModuleWithActionsResponse): ResolvedAction[] {
  const actions: ResolvedAction[] = [];
  for (const resource of metadata.resources) {
    for (const method of resource.httpMethods) {
      const ui = method.action.uiConfig as ResourceUiConfig | undefined;
      if (ui?.component) {
        actions.push({ resource, method, action: method.action, uiConfig: ui });
      }
    }
  }
  return actions;
}

/** Active view state */
type ViewState =
  | { component: 'list' }
  | { component: 'detail' | 'form' | 'confirm' | 'modal-form'; code: string; href: string; item: HateoasDataItem };

/**
 * Generic module component.
 *
 * Renders list actions in default view. GenericList emits onAction
 * events which GenericModule handles to transition to detail/form/confirm views.
 */
export function GenericModule({ moduleCode, metadata }: ModuleProps) {
  const [viewState, setViewState] = useState<ViewState>({ component: 'list' });

  const allActions = useMemo(() => extractActions(metadata), [metadata]);

  const actionsMap = useMemo(() => {
    const map = new Map<string, ResolvedAction>();
    for (const a of allActions) {
      map.set(a.method.action.code, a);
    }
    return map;
  }, [allActions]);

  const listActions = useMemo(
    () => allActions.filter((a) => isListUiConfig(a.uiConfig)),
    [allActions],
  );

  const handleBack = useCallback(() => {
    setViewState({ component: 'list' });
  }, []);

  const handleSuccess = useCallback(() => {
    setViewState({ component: 'list' });
  }, []);

  const isDefault = viewState.component === 'list';

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={metadata.label}
        description={metadata.description}
        icon={metadata.icon}
        onBack={!isDefault ? handleBack : undefined}
      />

      {/* List view */}
      {isDefault && (
        <>
          {listActions.length > 0 ? (
            listActions.map((la) => (
              <GenericList
                key={`${la.resource.code}-${la.method.method}`}
                config={la.uiConfig as ListUiConfig}
                linkConfig={la.action.linkConfig}
                endpoint={la.resource.templateUrl}
                title={metadata.label}
                moduleCode={moduleCode}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              Este modulo no tiene vistas configuradas.
            </div>
          )}
        </>
      )}

      {/* Detail view */}
      {viewState.component === 'detail' && 'href' in viewState && (
        <GenericDetail
          config={actionsMap.get(viewState.code)!.uiConfig as DetailUiConfig}
          endpoint={viewState.href}
          title={metadata.label}
          id={viewState.item.id}
          onBack={handleBack}
        />
      )}

      {/* Form view */}
      {viewState.component === 'form' && 'href' in viewState && (
        <GenericForm
          config={actionsMap.get(viewState.code)!.uiConfig as FormUiConfig}
          endpoint={viewState.href}
          title={metadata.label}
          mode={viewState.item.id ? 'edit' : 'create'}
          id={viewState.item.id || undefined}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}

      {/* Confirm — placeholder */}
      {viewState.component === 'confirm' && 'href' in viewState && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-6">
          <p className="text-sm text-yellow-800">
            Accion de confirmacion pendiente de implementar (code: {viewState.code}).
          </p>
          <button type="button" onClick={handleBack} className="mt-3 text-sm font-medium text-yellow-700 hover:text-yellow-600">
            Volver
          </button>
        </div>
      )}

      {/* Modal form — placeholder */}
      {viewState.component === 'modal-form' && 'href' in viewState && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-6">
          <p className="text-sm text-blue-800">
            Modal form pendiente de implementar (code: {viewState.code}).
          </p>
          <button type="button" onClick={handleBack} className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-600">
            Volver
          </button>
        </div>
      )}
    </div>
  );
}
