/**
 * Constants for module forms
 * Action templates, default settings, and CRUD action definitions
 */

import type { ModuleAction, ActionSettings } from './types';

// CRUD action codes
export const CRUD_ACTION_CODES = ['read', 'create', 'update', 'delete'] as const;

// Default CRUD actions templates
export const DEFAULT_CRUD_ACTIONS: ModuleAction[] = [
  {
    code: 'read',
    label: 'Ver',
    description: 'Ver listado y detalle de registros',
    settings: {
      type: 'read',
      listColumns: [],
      filters: [],
      defaultSort: { field: 'createdAt', order: 'desc' },
    },
  },
  {
    code: 'create',
    label: 'Crear',
    description: 'Crear nuevos registros',
    settings: {
      type: 'create',
      fields: [],
    },
  },
  {
    code: 'update',
    label: 'Editar',
    description: 'Modificar registros existentes',
    settings: {
      type: 'update',
      fields: [],
    },
  },
  {
    code: 'delete',
    label: 'Eliminar',
    description: 'Eliminar registros',
    settings: {
      type: 'delete',
      confirmation: '¿Esta seguro de eliminar este registro?',
      soft: true,
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
      settings: { type: 'generic' },
    },
    {
      code: 'export',
      label: 'Exportar',
      description: 'Descargar en PDF/Excel',
      settings: { type: 'generic' },
    },
  ],
  audit: [
    {
      code: 'read',
      label: 'Ver auditoria',
      description: 'Consultar historial de cambios',
      settings: { type: 'generic' },
    },
  ],
  pqr: [
    {
      code: 'create',
      label: 'Crear PQR',
      description: 'Crear nueva peticion, queja o reclamo',
      settings: { type: 'create', fields: [] },
    },
    {
      code: 'read',
      label: 'Ver PQR',
      description: 'Consultar PQRs',
      settings: { type: 'read', listColumns: [], filters: [] },
    },
    {
      code: 'manage',
      label: 'Gestionar PQR',
      description: 'Responder y cerrar PQR',
      settings: { type: 'generic' },
    },
  ],
  notifications: [
    {
      code: 'read',
      label: 'Ver notificaciones',
      description: 'Consultar notificaciones',
      settings: { type: 'generic' },
    },
    {
      code: 'create',
      label: 'Enviar notificaciones',
      description: 'Crear y enviar notificaciones',
      settings: { type: 'generic' },
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
        type: 'read',
        listColumns: [],
        filters: [],
        defaultSort: { field: 'createdAt', order: 'desc' },
      };
    case 'create':
      return {
        type: 'create',
        fields: [],
      };
    case 'update':
      return {
        type: 'update',
        fields: [],
      };
    case 'delete':
      return {
        type: 'delete',
        confirmation: '¿Esta seguro de eliminar este registro?',
        soft: true,
      };
    default:
      return { type: 'generic' };
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
