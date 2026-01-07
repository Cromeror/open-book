import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to seed module metadata and actions configuration
 *
 * Updates existing modules with:
 * - icon, type, entity, endpoint, component
 * - nav_config (path and order)
 * - actions_config (full action definitions)
 */
export class SeedModuleMetadata1736166000000 implements MigrationInterface {
  name = 'SeedModuleMetadata1736166000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update modules with metadata
    await queryRunner.query(`
      UPDATE modules SET
        icon = 'Users',
        type = 'crud',
        entity = 'Usuario',
        endpoint = '/api/users',
        nav_config = '{"path": "/m/users", "order": 10}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver lista de usuarios",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "email", "label": "Email", "sortable": true},
                {"field": "firstName", "label": "Nombre", "sortable": true},
                {"field": "lastName", "label": "Apellido", "sortable": true},
                {"field": "isActive", "label": "Activo", "format": "boolean"}
              ],
              "filters": [
                {"field": "email", "type": "text", "label": "Email"},
                {"field": "isActive", "type": "select", "label": "Estado", "options": [{"value": "true", "label": "Activo"}, {"value": "false", "label": "Inactivo"}]}
              ],
              "sortable": ["email", "firstName", "lastName", "createdAt"]
            }
          },
          {
            "code": "update",
            "label": "Editar",
            "description": "Editar usuarios",
            "settings": {
              "type": "update",
              "fields": [
                {"name": "firstName", "label": "Nombre", "type": "text", "required": true},
                {"name": "lastName", "label": "Apellido", "type": "text", "required": true},
                {"name": "phone", "label": "Telefono", "type": "text"},
                {"name": "isActive", "label": "Activo", "type": "boolean"}
              ]
            }
          }
        ]'::jsonb,
        "order" = 10
      WHERE code = 'users'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'Building2',
        type = 'crud',
        entity = 'Copropiedad',
        endpoint = '/api/copropiedades',
        nav_config = '{"path": "/m/copropiedades", "order": 20}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver copropiedades",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "name", "label": "Nombre", "sortable": true},
                {"field": "address", "label": "Direccion"},
                {"field": "city", "label": "Ciudad", "sortable": true}
              ],
              "filters": [
                {"field": "city", "type": "text", "label": "Ciudad"}
              ]
            }
          },
          {
            "code": "update",
            "label": "Editar",
            "description": "Editar copropiedades",
            "settings": {
              "type": "update",
              "fields": [
                {"name": "name", "label": "Nombre", "type": "text", "required": true},
                {"name": "address", "label": "Direccion", "type": "text", "required": true},
                {"name": "city", "label": "Ciudad", "type": "text", "required": true}
              ]
            }
          }
        ]'::jsonb,
        "order" = 20
      WHERE code = 'copropiedades'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'Home',
        type = 'crud',
        entity = 'Apartamento',
        endpoint = '/api/apartamentos',
        nav_config = '{"path": "/m/apartamentos", "order": 30}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver apartamentos",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "number", "label": "Numero", "sortable": true},
                {"field": "block", "label": "Bloque"},
                {"field": "floor", "label": "Piso", "sortable": true}
              ]
            }
          },
          {
            "code": "create",
            "label": "Crear",
            "description": "Crear apartamentos",
            "settings": {
              "type": "create",
              "fields": [
                {"name": "number", "label": "Numero", "type": "text", "required": true},
                {"name": "block", "label": "Bloque", "type": "text"},
                {"name": "floor", "label": "Piso", "type": "number"}
              ]
            }
          },
          {
            "code": "update",
            "label": "Editar",
            "description": "Editar apartamentos",
            "settings": {
              "type": "update",
              "fields": [
                {"name": "number", "label": "Numero", "type": "text", "required": true},
                {"name": "block", "label": "Bloque", "type": "text"},
                {"name": "floor", "label": "Piso", "type": "number"}
              ]
            }
          },
          {
            "code": "delete",
            "label": "Eliminar",
            "description": "Eliminar apartamentos",
            "settings": {
              "type": "delete",
              "confirmation": "Esta seguro que desea eliminar este apartamento?",
              "soft": true
            }
          }
        ]'::jsonb,
        "order" = 30
      WHERE code = 'apartamentos'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'Target',
        type = 'crud',
        entity = 'Objetivo',
        endpoint = '/api/objetivos',
        nav_config = '{"path": "/m/objetivos", "order": 40}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver objetivos de recaudo",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "name", "label": "Nombre", "sortable": true},
                {"field": "targetAmount", "label": "Meta", "format": "money", "sortable": true},
                {"field": "currentAmount", "label": "Recaudado", "format": "money"},
                {"field": "deadline", "label": "Fecha Limite", "format": "date", "sortable": true},
                {"field": "status", "label": "Estado"}
              ],
              "filters": [
                {"field": "status", "type": "select", "label": "Estado", "options": [{"value": "active", "label": "Activo"}, {"value": "completed", "label": "Completado"}, {"value": "cancelled", "label": "Cancelado"}]}
              ],
              "defaultSort": {"field": "deadline", "order": "asc"}
            }
          },
          {
            "code": "create",
            "label": "Crear",
            "description": "Crear objetivos de recaudo",
            "settings": {
              "type": "create",
              "fields": [
                {"name": "name", "label": "Nombre", "type": "text", "required": true},
                {"name": "description", "label": "Descripcion", "type": "textarea"},
                {"name": "targetAmount", "label": "Monto Meta", "type": "money", "required": true, "min": 0},
                {"name": "deadline", "label": "Fecha Limite", "type": "date", "required": true}
              ]
            }
          },
          {
            "code": "update",
            "label": "Editar",
            "description": "Editar objetivos de recaudo",
            "settings": {
              "type": "update",
              "fields": [
                {"name": "name", "label": "Nombre", "type": "text", "required": true},
                {"name": "description", "label": "Descripcion", "type": "textarea"},
                {"name": "targetAmount", "label": "Monto Meta", "type": "money", "required": true, "min": 0},
                {"name": "deadline", "label": "Fecha Limite", "type": "date", "required": true}
              ]
            }
          },
          {
            "code": "delete",
            "label": "Eliminar",
            "description": "Eliminar objetivos de recaudo",
            "settings": {
              "type": "delete",
              "confirmation": "Esta seguro que desea eliminar este objetivo? Se eliminaran tambien las actividades y compromisos asociados.",
              "soft": true
            }
          }
        ]'::jsonb,
        "order" = 40
      WHERE code = 'objetivos'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'Calendar',
        type = 'crud',
        entity = 'Actividad',
        endpoint = '/api/actividades',
        nav_config = '{"path": "/m/actividades", "order": 50}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver actividades de recaudo",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "name", "label": "Nombre", "sortable": true},
                {"field": "type", "label": "Tipo"},
                {"field": "date", "label": "Fecha", "format": "date", "sortable": true},
                {"field": "targetAmount", "label": "Meta", "format": "money"}
              ]
            }
          },
          {
            "code": "create",
            "label": "Crear",
            "description": "Crear actividades de recaudo",
            "settings": {
              "type": "create",
              "fields": [
                {"name": "name", "label": "Nombre", "type": "text", "required": true},
                {"name": "type", "label": "Tipo", "type": "select", "required": true, "options": [{"value": "rifa", "label": "Rifa"}, {"value": "donacion", "label": "Donacion"}, {"value": "evento", "label": "Evento"}]},
                {"name": "description", "label": "Descripcion", "type": "textarea"},
                {"name": "date", "label": "Fecha", "type": "date", "required": true},
                {"name": "targetAmount", "label": "Meta", "type": "money"}
              ]
            }
          },
          {
            "code": "update",
            "label": "Editar",
            "description": "Editar actividades de recaudo",
            "settings": {
              "type": "update",
              "fields": [
                {"name": "name", "label": "Nombre", "type": "text", "required": true},
                {"name": "type", "label": "Tipo", "type": "select", "required": true, "options": [{"value": "rifa", "label": "Rifa"}, {"value": "donacion", "label": "Donacion"}, {"value": "evento", "label": "Evento"}]},
                {"name": "description", "label": "Descripcion", "type": "textarea"},
                {"name": "date", "label": "Fecha", "type": "date", "required": true},
                {"name": "targetAmount", "label": "Meta", "type": "money"}
              ]
            }
          },
          {
            "code": "delete",
            "label": "Eliminar",
            "description": "Eliminar actividades de recaudo",
            "settings": {
              "type": "delete",
              "confirmation": "Esta seguro que desea eliminar esta actividad?",
              "soft": true
            }
          }
        ]'::jsonb,
        "order" = 50
      WHERE code = 'actividades'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'FileText',
        type = 'crud',
        entity = 'Compromiso',
        endpoint = '/api/compromisos',
        nav_config = '{"path": "/m/compromisos", "order": 60}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver compromisos",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "apartamento", "label": "Apartamento"},
                {"field": "amount", "label": "Monto", "format": "money", "sortable": true},
                {"field": "status", "label": "Estado"},
                {"field": "createdAt", "label": "Fecha", "format": "date", "sortable": true}
              ]
            }
          },
          {
            "code": "create",
            "label": "Crear",
            "description": "Crear compromisos",
            "settings": {
              "type": "create",
              "fields": [
                {"name": "apartamentoId", "label": "Apartamento", "type": "select", "required": true},
                {"name": "amount", "label": "Monto", "type": "money", "required": true, "min": 0}
              ]
            }
          },
          {
            "code": "update",
            "label": "Editar",
            "description": "Editar compromisos",
            "settings": {
              "type": "update",
              "fields": [
                {"name": "amount", "label": "Monto", "type": "money", "required": true, "min": 0},
                {"name": "status", "label": "Estado", "type": "select", "options": [{"value": "pending", "label": "Pendiente"}, {"value": "partial", "label": "Parcial"}, {"value": "fulfilled", "label": "Cumplido"}]}
              ]
            }
          }
        ]'::jsonb,
        "order" = 60
      WHERE code = 'compromisos'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'DollarSign',
        type = 'crud',
        entity = 'Aporte',
        endpoint = '/api/aportes',
        nav_config = '{"path": "/m/aportes", "order": 70}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver aportes reales",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "apartamento", "label": "Apartamento"},
                {"field": "amount", "label": "Monto", "format": "money", "sortable": true},
                {"field": "date", "label": "Fecha", "format": "date", "sortable": true},
                {"field": "reference", "label": "Referencia"}
              ],
              "filters": [
                {"field": "date", "type": "dateRange", "label": "Fecha"}
              ]
            }
          },
          {
            "code": "create",
            "label": "Registrar",
            "description": "Registrar aportes",
            "settings": {
              "type": "create",
              "fields": [
                {"name": "apartamentoId", "label": "Apartamento", "type": "select", "required": true},
                {"name": "amount", "label": "Monto", "type": "money", "required": true, "min": 0},
                {"name": "date", "label": "Fecha", "type": "date", "required": true},
                {"name": "reference", "label": "Referencia", "type": "text"},
                {"name": "notes", "label": "Notas", "type": "textarea"}
              ]
            }
          },
          {
            "code": "update",
            "label": "Editar",
            "description": "Editar aportes",
            "settings": {
              "type": "update",
              "fields": [
                {"name": "amount", "label": "Monto", "type": "money", "required": true, "min": 0},
                {"name": "date", "label": "Fecha", "type": "date", "required": true},
                {"name": "reference", "label": "Referencia", "type": "text"},
                {"name": "notes", "label": "Notas", "type": "textarea"}
              ]
            }
          }
        ]'::jsonb,
        "order" = 70
      WHERE code = 'aportes'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'MessageSquare',
        type = 'crud',
        entity = 'PQR',
        endpoint = '/api/pqr',
        nav_config = '{"path": "/m/pqr", "order": 80}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver",
            "description": "Ver PQR",
            "settings": {
              "type": "read",
              "listColumns": [
                {"field": "subject", "label": "Asunto", "sortable": true},
                {"field": "type", "label": "Tipo"},
                {"field": "status", "label": "Estado"},
                {"field": "createdAt", "label": "Fecha", "format": "date", "sortable": true}
              ],
              "filters": [
                {"field": "type", "type": "select", "label": "Tipo", "options": [{"value": "peticion", "label": "Peticion"}, {"value": "queja", "label": "Queja"}, {"value": "reclamo", "label": "Reclamo"}]},
                {"field": "status", "type": "select", "label": "Estado", "options": [{"value": "open", "label": "Abierto"}, {"value": "in_progress", "label": "En Proceso"}, {"value": "closed", "label": "Cerrado"}]}
              ]
            }
          },
          {
            "code": "create",
            "label": "Crear",
            "description": "Crear PQR",
            "settings": {
              "type": "create",
              "fields": [
                {"name": "type", "label": "Tipo", "type": "select", "required": true, "options": [{"value": "peticion", "label": "Peticion"}, {"value": "queja", "label": "Queja"}, {"value": "reclamo", "label": "Reclamo"}]},
                {"name": "subject", "label": "Asunto", "type": "text", "required": true},
                {"name": "description", "label": "Descripcion", "type": "textarea", "required": true}
              ]
            }
          },
          {
            "code": "manage",
            "label": "Gestionar",
            "description": "Gestionar PQR",
            "settings": {
              "type": "generic",
              "allowedActions": ["respond", "escalate", "close"]
            }
          }
        ]'::jsonb,
        "order" = 80
      WHERE code = 'pqr'
    `);

    // Specialized modules
    await queryRunner.query(`
      UPDATE modules SET
        icon = 'BarChart3',
        type = 'specialized',
        component = 'ReportsModule',
        nav_config = '{"path": "/reports", "order": 90}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver reportes",
            "description": "Visualizar reportes",
            "settings": {"type": "generic"}
          },
          {
            "code": "export",
            "label": "Exportar",
            "description": "Exportar reportes a PDF/Excel",
            "settings": {"type": "generic", "formats": ["pdf", "excel", "csv"]}
          }
        ]'::jsonb,
        "order" = 90
      WHERE code = 'reportes'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'FileText',
        type = 'specialized',
        component = 'AuditModule',
        nav_config = '{"path": "/audit", "order": 100}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver auditoria",
            "description": "Ver log de auditoria",
            "settings": {"type": "generic"}
          }
        ]'::jsonb,
        "order" = 100
      WHERE code = 'auditoria'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'Bell',
        type = 'specialized',
        component = 'NotificationsModule',
        nav_config = '{"path": "/notifications", "order": 110}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver notificaciones",
            "description": "Ver notificaciones",
            "settings": {"type": "generic"}
          },
          {
            "code": "create",
            "label": "Enviar",
            "description": "Enviar notificaciones",
            "settings": {"type": "generic"}
          }
        ]'::jsonb,
        "order" = 110
      WHERE code = 'notificaciones'
    `);

    await queryRunner.query(`
      UPDATE modules SET
        icon = 'Settings',
        type = 'specialized',
        component = 'SettingsModule',
        nav_config = '{"path": "/settings", "order": 120}'::jsonb,
        actions_config = '[
          {
            "code": "read",
            "label": "Ver configuracion",
            "description": "Ver configuracion del sistema",
            "settings": {"type": "generic"}
          },
          {
            "code": "update",
            "label": "Modificar",
            "description": "Modificar configuracion",
            "settings": {"type": "generic"}
          }
        ]'::jsonb,
        "order" = 120
      WHERE code = 'configuracion'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reset all metadata columns to null/default
    await queryRunner.query(`
      UPDATE modules SET
        icon = NULL,
        type = 'crud',
        entity = NULL,
        endpoint = NULL,
        component = NULL,
        nav_config = NULL,
        actions_config = NULL,
        "order" = 0
    `);
  }
}
