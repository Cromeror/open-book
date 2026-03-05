/**
 * Constants for module forms
 * Action templates, default settings, and CRUD action definitions
 */

import type { ModuleAction, ActionSettings } from './types';
import { UI_COMPONENTS, SORT_ORDERS } from './types';

// CRUD action codes
export const CRUD_ACTION_CODES = ['read', 'create', 'update', 'delete'] as const;

// Default CRUD actions templates
export const DEFAULT_CRUD_ACTIONS: ModuleAction[] = [
  {
    code: 'read',
    label: 'Ver',
    description: 'Ver listado y detalle de registros',
    settings: {
      component: UI_COMPONENTS.LIST,
      columns: [],
      filters: [],
      defaultSort: { field: 'createdAt', order: SORT_ORDERS.DESC },
    },
  },
  {
    code: 'create',
    label: 'Crear',
    description: 'Crear nuevos registros',
    settings: {
      component: UI_COMPONENTS.FORM,
      fields: [],
    },
  },
  {
    code: 'update',
    label: 'Editar',
    description: 'Modificar registros existentes',
    settings: {
      component: UI_COMPONENTS.FORM,
      fields: [],
    },
  },
  {
    code: 'delete',
    label: 'Eliminar',
    description: 'Eliminar registros',
    settings: {
      component: UI_COMPONENTS.CONFIRM,
      message: '¿Esta seguro de eliminar este registro?',
      variant: 'danger',
    },
  },
];

// Specialized action templates
export const SPECIALIZED_ACTION_TEMPLATES: Record<string, ModuleAction[]> = {
  reports: [
    {
      code: 'read',
      label: 'Ver reportes',
      description: 'Consultar reportes disponibles',
      settings: { component: UI_COMPONENTS.LIST, columns: [] },
    },
    {
      code: 'export',
      label: 'Exportar',
      description: 'Descargar en PDF/Excel',
      settings: { component: UI_COMPONENTS.CONFIRM, message: '¿Desea exportar este reporte?' },
    },
  ],
  audit: [
    {
      code: 'read',
      label: 'Ver auditoria',
      description: 'Consultar historial de cambios',
      settings: { component: UI_COMPONENTS.LIST, columns: [] },
    },
  ],
  pqr: [
    {
      code: 'create',
      label: 'Crear PQR',
      description: 'Crear nueva peticion, queja o reclamo',
      settings: { component: UI_COMPONENTS.FORM, fields: [] },
    },
    {
      code: 'read',
      label: 'Ver PQR',
      description: 'Consultar PQRs',
      settings: { component: UI_COMPONENTS.LIST, columns: [], filters: [] },
    },
    {
      code: 'manage',
      label: 'Gestionar PQR',
      description: 'Responder y cerrar PQR',
      settings: { component: UI_COMPONENTS.MODAL_FORM, fields: [] },
    },
  ],
  notifications: [
    {
      code: 'read',
      label: 'Ver notificaciones',
      description: 'Consultar notificaciones',
      settings: { component: UI_COMPONENTS.LIST, columns: [] },
    },
    {
      code: 'create',
      label: 'Enviar notificaciones',
      description: 'Crear y enviar notificaciones',
      settings: { component: UI_COMPONENTS.FORM, fields: [] },
    },
  ],
};

/**
 * Get default settings based on action code
 */
export function getDefaultSettingsForCode(code: string): ActionSettings {
  switch (code) {
    case 'read':
      return {
        component: UI_COMPONENTS.LIST,
        columns: [],
        filters: [],
        defaultSort: { field: 'createdAt', order: SORT_ORDERS.DESC },
      };
    case 'create':
      return {
        component: UI_COMPONENTS.FORM,
        fields: [],
      };
    case 'update':
      return {
        component: UI_COMPONENTS.FORM,
        fields: [],
      };
    case 'delete':
      return {
        component: UI_COMPONENTS.CONFIRM,
        message: '¿Esta seguro de eliminar este registro?',
        variant: 'danger',
      };
    default:
      return { component: UI_COMPONENTS.LIST, columns: [] };
  }
}

/**
 * Get default label based on action code
 */
export function getDefaultLabelForCode(code: string): string {
  switch (code) {
    case 'read':
      return 'Ver';
    case 'create':
      return 'Crear';
    case 'update':
      return 'Editar';
    case 'delete':
      return 'Eliminar';
    default:
      return code.charAt(0).toUpperCase() + code.slice(1);
  }
}

/**
 * Check if a code is a CRUD action code
 */
export function isCrudActionCode(code: string): boolean {
  return (CRUD_ACTION_CODES as readonly string[]).includes(code);
}
