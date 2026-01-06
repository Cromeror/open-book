import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to seed initial system modules and their permissions
 *
 * This creates the base modules required by the permission system.
 * New modules can be added via additional migrations.
 */
export class SeedInitialModules1736162000000 implements MigrationInterface {
  name = 'SeedInitialModules1736162000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed modules and their permissions
    const modules = [
      {
        code: 'users',
        name: 'Gestión de Usuarios',
        description: 'Administración de usuarios del sistema',
        permissions: [
          { code: 'read', name: 'Ver usuarios', description: 'Ver lista y detalle de usuarios' },
          { code: 'update', name: 'Editar usuarios', description: 'Modificar datos de usuarios' },
        ],
      },
      {
        code: 'copropiedades',
        name: 'Copropiedades',
        description: 'Gestión de copropiedades/edificios',
        permissions: [
          { code: 'read', name: 'Ver copropiedades', description: 'Ver información de copropiedades' },
          { code: 'update', name: 'Editar copropiedades', description: 'Modificar datos de copropiedades' },
        ],
      },
      {
        code: 'apartamentos',
        name: 'Apartamentos',
        description: 'Gestión de apartamentos/unidades',
        permissions: [
          { code: 'create', name: 'Crear apartamentos', description: null },
          { code: 'read', name: 'Ver apartamentos', description: null },
          { code: 'update', name: 'Editar apartamentos', description: null },
          { code: 'delete', name: 'Eliminar apartamentos', description: null },
        ],
      },
      {
        code: 'objetivos',
        name: 'Objetivos de Recaudo',
        description: 'Definición de metas de recaudo',
        permissions: [
          { code: 'create', name: 'Crear objetivos', description: null },
          { code: 'read', name: 'Ver objetivos', description: null },
          { code: 'update', name: 'Editar objetivos', description: null },
          { code: 'delete', name: 'Eliminar objetivos', description: null },
        ],
      },
      {
        code: 'actividades',
        name: 'Actividades de Recaudo',
        description: 'Rifas, donaciones, eventos vinculados a objetivos',
        permissions: [
          { code: 'create', name: 'Crear actividades', description: null },
          { code: 'read', name: 'Ver actividades', description: null },
          { code: 'update', name: 'Editar actividades', description: null },
          { code: 'delete', name: 'Eliminar actividades', description: null },
        ],
      },
      {
        code: 'compromisos',
        name: 'Compromisos',
        description: 'Promesas de aporte de apartamentos',
        permissions: [
          { code: 'create', name: 'Crear compromisos', description: null },
          { code: 'read', name: 'Ver compromisos', description: null },
          { code: 'update', name: 'Editar compromisos', description: null },
        ],
      },
      {
        code: 'aportes',
        name: 'Aportes Reales',
        description: 'Registro de contribuciones efectivas',
        permissions: [
          { code: 'create', name: 'Registrar aportes', description: null },
          { code: 'read', name: 'Ver aportes', description: null },
          { code: 'update', name: 'Editar aportes', description: null },
        ],
      },
      {
        code: 'pqr',
        name: 'PQR',
        description: 'Peticiones, quejas y reclamos',
        permissions: [
          { code: 'create', name: 'Crear PQR', description: null },
          { code: 'read', name: 'Ver PQR', description: null },
          { code: 'manage', name: 'Gestionar PQR', description: 'Responder y cerrar PQR' },
        ],
      },
      {
        code: 'reportes',
        name: 'Reportes',
        description: 'Generación de reportes del sistema',
        permissions: [
          { code: 'read', name: 'Ver reportes', description: null },
          { code: 'export', name: 'Exportar reportes', description: 'Descargar en PDF/Excel' },
        ],
      },
      {
        code: 'auditoria',
        name: 'Auditoría',
        description: 'Logs de auditoría del sistema',
        permissions: [
          { code: 'read', name: 'Ver auditoría', description: 'Consultar historial de cambios' },
        ],
      },
      {
        code: 'notificaciones',
        name: 'Notificaciones',
        description: 'Sistema de notificaciones',
        permissions: [
          { code: 'read', name: 'Ver notificaciones', description: null },
          { code: 'create', name: 'Enviar notificaciones', description: null },
        ],
      },
      {
        code: 'configuracion',
        name: 'Configuración',
        description: 'Configuración del sistema',
        permissions: [
          { code: 'read', name: 'Ver configuración', description: null },
          { code: 'update', name: 'Modificar configuración', description: null },
        ],
      },
    ];

    for (const module of modules) {
      // Insert module
      const [insertedModule] = await queryRunner.query(
        `INSERT INTO modules (code, name, description, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (code) DO UPDATE SET name = $2, description = $3
         RETURNING id`,
        [module.code, module.name, module.description]
      );

      // Insert permissions for the module
      for (const permission of module.permissions) {
        await queryRunner.query(
          `INSERT INTO module_permissions (module_id, code, name, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (module_id, code) DO UPDATE SET name = $3, description = $4`,
          [insertedModule.id, permission.code, permission.name, permission.description]
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all permissions first (due to FK constraints)
    await queryRunner.query(`DELETE FROM module_permissions`);

    // Delete all modules
    await queryRunner.query(`DELETE FROM modules`);
  }
}
