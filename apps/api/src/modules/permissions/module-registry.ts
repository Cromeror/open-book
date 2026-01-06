/**
 * Module definition for the permission system
 */
export interface ModuleDefinition {
  code: string;
  name: string;
  description: string;
  permissions: {
    code: string;
    name: string;
    description?: string;
  }[];
}

/**
 * System modules configuration
 * These modules are registered via migration
 */
export const SYSTEM_MODULES: ModuleDefinition[] = [
  {
    code: 'users',
    name: 'Gestión de Usuarios',
    description: 'Administración de usuarios del sistema',
    permissions: [
      {
        code: 'read',
        name: 'Ver usuarios',
        description: 'Ver lista y detalle de usuarios',
      },
      {
        code: 'update',
        name: 'Editar usuarios',
        description: 'Modificar datos de usuarios',
      },
    ],
  },
  {
    code: 'copropiedades',
    name: 'Copropiedades',
    description: 'Gestión de copropiedades/edificios',
    permissions: [
      {
        code: 'read',
        name: 'Ver copropiedades',
        description: 'Ver información de copropiedades',
      },
      {
        code: 'update',
        name: 'Editar copropiedades',
        description: 'Modificar datos de copropiedades',
      },
    ],
  },
  {
    code: 'apartamentos',
    name: 'Apartamentos',
    description: 'Gestión de apartamentos/unidades',
    permissions: [
      { code: 'create', name: 'Crear apartamentos' },
      { code: 'read', name: 'Ver apartamentos' },
      { code: 'update', name: 'Editar apartamentos' },
      { code: 'delete', name: 'Eliminar apartamentos' },
    ],
  },
  {
    code: 'objetivos',
    name: 'Objetivos de Recaudo',
    description: 'Definición de metas de recaudo',
    permissions: [
      { code: 'create', name: 'Crear objetivos' },
      { code: 'read', name: 'Ver objetivos' },
      { code: 'update', name: 'Editar objetivos' },
      { code: 'delete', name: 'Eliminar objetivos' },
    ],
  },
  {
    code: 'actividades',
    name: 'Actividades de Recaudo',
    description: 'Rifas, donaciones, eventos vinculados a objetivos',
    permissions: [
      { code: 'create', name: 'Crear actividades' },
      { code: 'read', name: 'Ver actividades' },
      { code: 'update', name: 'Editar actividades' },
      { code: 'delete', name: 'Eliminar actividades' },
    ],
  },
  {
    code: 'compromisos',
    name: 'Compromisos',
    description: 'Promesas de aporte de apartamentos',
    permissions: [
      { code: 'create', name: 'Crear compromisos' },
      { code: 'read', name: 'Ver compromisos' },
      { code: 'update', name: 'Editar compromisos' },
    ],
  },
  {
    code: 'aportes',
    name: 'Aportes Reales',
    description: 'Registro de contribuciones efectivas',
    permissions: [
      { code: 'create', name: 'Registrar aportes' },
      { code: 'read', name: 'Ver aportes' },
      { code: 'update', name: 'Editar aportes' },
    ],
  },
  {
    code: 'pqr',
    name: 'PQR',
    description: 'Peticiones, quejas y reclamos',
    permissions: [
      { code: 'create', name: 'Crear PQR' },
      { code: 'read', name: 'Ver PQR' },
      {
        code: 'manage',
        name: 'Gestionar PQR',
        description: 'Responder y cerrar PQR',
      },
    ],
  },
  {
    code: 'reportes',
    name: 'Reportes',
    description: 'Generación de reportes del sistema',
    permissions: [
      { code: 'read', name: 'Ver reportes' },
      {
        code: 'export',
        name: 'Exportar reportes',
        description: 'Descargar en PDF/Excel',
      },
    ],
  },
  {
    code: 'auditoria',
    name: 'Auditoría',
    description: 'Logs de auditoría del sistema',
    permissions: [
      {
        code: 'read',
        name: 'Ver auditoría',
        description: 'Consultar historial de cambios',
      },
    ],
  },
  {
    code: 'notificaciones',
    name: 'Notificaciones',
    description: 'Sistema de notificaciones',
    permissions: [
      { code: 'read', name: 'Ver notificaciones' },
      { code: 'create', name: 'Enviar notificaciones' },
    ],
  },
  {
    code: 'configuracion',
    name: 'Configuración',
    description: 'Configuración del sistema',
    permissions: [
      { code: 'read', name: 'Ver configuración' },
      { code: 'update', name: 'Modificar configuración' },
    ],
  },
];
