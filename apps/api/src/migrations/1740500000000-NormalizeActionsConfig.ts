import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normalize actions_config JSONB data in modules table.
 *
 * Transforms:
 * - `settings` key → `uiConfig`
 * - `uiConfig.type` → `uiConfig.component` with value mapping:
 *     read → list, create → form, update → form, delete → confirm
 * - `uiConfig.listColumns` → `uiConfig.columns`
 * - `uiConfig.confirmation` → `uiConfig.message`
 * - Removes `uiConfig.soft`
 * - Removes top-level `uiConfig.sortable` (sortable is per-column)
 * - Adds `httpMethod` based on action code (read→GET, create→POST, update→PATCH, delete→DELETE)
 */
export class NormalizeActionsConfig1740500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all modules with actions_config
    const modules = await queryRunner.query(
      `SELECT id, code, actions_config FROM modules WHERE actions_config IS NOT NULL`,
    );

    for (const mod of modules) {
      const actions: unknown[] = mod.actions_config;
      if (!Array.isArray(actions)) continue;

      const transformed = (actions as Record<string, unknown>[]).map((action) => {
        const result: Record<string, unknown> = {};

        // Keep code, label, description
        result.code = action.code;
        result.label = action.label;
        if (action.description) result.description = action.description;

        // Determine httpMethod — use existing or derive from code
        result.httpMethod =
          action.httpMethod || this.codeToHttpMethod(action.code as string);

        // Normalize uiConfig: prefer existing uiConfig, fall back to settings
        const rawConfig = (action.uiConfig ||
          action.settings ||
          {}) as Record<string, unknown>;
        const uiConfig: Record<string, unknown> = { ...rawConfig };

        // Map type → component
        const oldType = uiConfig.type as string | undefined;
        if (oldType) {
          uiConfig.component = this.typeToComponent(oldType);
          delete uiConfig.type;
        }

        // Rename listColumns → columns
        if ('listColumns' in uiConfig) {
          uiConfig.columns = uiConfig.listColumns;
          delete uiConfig.listColumns;
        }

        // Rename confirmation → message
        if ('confirmation' in uiConfig) {
          uiConfig.message = uiConfig.confirmation;
          delete uiConfig.confirmation;
        }

        // Remove soft (no longer needed)
        delete uiConfig.soft;

        // Remove top-level sortable array (sortable is per-column now)
        delete uiConfig.sortable;

        // Only set uiConfig if it has meaningful content (not just empty)
        const hasContent = Object.keys(uiConfig).some(
          (k) => k !== 'component',
        );
        if (uiConfig.component || hasContent) {
          result.uiConfig = uiConfig;
        }

        return result;
      });

      await queryRunner.query(
        `UPDATE modules SET actions_config = $1::jsonb WHERE id = $2`,
        [JSON.stringify(transformed), mod.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get all modules with actions_config
    const modules = await queryRunner.query(
      `SELECT id, code, actions_config FROM modules WHERE actions_config IS NOT NULL`,
    );

    for (const mod of modules) {
      const actions: unknown[] = mod.actions_config;
      if (!Array.isArray(actions)) continue;

      const reverted = (actions as Record<string, unknown>[]).map((action) => {
        const result: Record<string, unknown> = {};

        result.code = action.code;
        result.label = action.label;
        if (action.description) result.description = action.description;

        // For goals module, keep uiConfig + httpMethod format
        // For others, convert back to settings format
        const uiConfig = (action.uiConfig || {}) as Record<string, unknown>;
        const settings: Record<string, unknown> = { ...uiConfig };

        // Reverse component → type
        if (settings.component) {
          settings.type = this.componentToType(
            settings.component as string,
            action.code as string,
          );
          delete settings.component;
        }

        // Reverse columns → listColumns
        if ('columns' in settings) {
          settings.listColumns = settings.columns;
          delete settings.columns;
        }

        // Reverse message → confirmation
        if ('message' in settings && settings.type === 'delete') {
          settings.confirmation = settings.message;
          delete settings.message;
        }

        result.settings = settings;
        // Don't restore httpMethod for non-goals modules (they didn't have it)
        if (mod.code === 'goals') {
          result.httpMethod = action.httpMethod;
          delete result.settings;
          result.uiConfig = settings;
        }

        return result;
      });

      await queryRunner.query(
        `UPDATE modules SET actions_config = $1::jsonb WHERE id = $2`,
        [JSON.stringify(reverted), mod.id],
      );
    }
  }

  private codeToHttpMethod(code: string): string {
    switch (code) {
      case 'read':
        return 'GET';
      case 'create':
        return 'POST';
      case 'update':
        return 'PATCH';
      case 'delete':
        return 'DELETE';
      default:
        return 'GET';
    }
  }

  private typeToComponent(type: string): string {
    switch (type) {
      case 'read':
        return 'list';
      case 'create':
        return 'form';
      case 'update':
        return 'form';
      case 'delete':
        return 'confirm';
      case 'generic':
        return 'list'; // default to list for generic
      default:
        return 'list';
    }
  }

  private componentToType(component: string, code: string): string {
    // For the reverse mapping, use the action code to determine the original type
    switch (code) {
      case 'read':
        return 'read';
      case 'create':
        return 'create';
      case 'update':
        return 'update';
      case 'delete':
        return 'delete';
      default:
        return 'generic';
    }
  }
}
