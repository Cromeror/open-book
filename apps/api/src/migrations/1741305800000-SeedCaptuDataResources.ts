import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds the CaptuData integration and its resources.
 *
 * Resources created (all linked to the captudata integration):
 * - captudata-projects       → /clients/{clientId}/projects/{projectId}
 * - captudata-cf-types       → /custom_fields/cf_types
 * - captudata-cf-definitions → /clients/{clientId}/definitions_by_class
 *
 * Each resource gets a GET http method association.
 * HATEOAS links: captudata-projects.GET → detail (self), cf_types (list), cf_definitions (list)
 */
export class SeedCaptuDataResources1741305800000 implements MigrationInterface {
  name = 'SeedCaptuDataResources1741305800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Insert integration
    const [integration] = await queryRunner.query(
      `INSERT INTO integrations (code, name, description, base_url, auth_type, connection_type, is_active)
       VALUES ($1, $2, $3, $4, 'devise_token_auth', 'passthrough', true)
       ON CONFLICT (code) DO UPDATE SET name = $2, description = $3, base_url = $4
       RETURNING id`,
      [
        'captudata',
        'CaptuData',
        'CaptuData project management API',
        'https://api-staging.captudata.com',
      ],
    );
    const integrationId = integration.id;

    // 2. Get the GET http method id
    const [getMethod] = await queryRunner.query(
      `SELECT id FROM http_methods WHERE method = 'GET'`,
    );
    const getMethodId = getMethod.id;

    // 3. Insert resources
    const resources = [
      {
        code: 'captudata-projects',
        name: 'CaptuData Projects',
        description: 'Project detail from CaptuData',
        templateUrl: '/clients/{clientId}/projects/{projectId}',
      },
      {
        code: 'captudata-cf-types',
        name: 'CaptuData CF Types',
        description: 'Custom field types catalog',
        templateUrl: '/custom_fields/cf_types',
      },
      {
        code: 'captudata-cf-definitions',
        name: 'CaptuData CF Definitions',
        description: 'Custom field definitions by class',
        templateUrl: '/clients/{clientId}/definitions_by_class',
      },
    ];

    for (const res of resources) {
      // Insert resource linked to integration
      const [inserted] = await queryRunner.query(
        `INSERT INTO resources (code, name, description, template_url, integration_id, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (code) DO UPDATE SET name = $2, description = $3, template_url = $4, integration_id = $5
         RETURNING id`,
        [res.code, res.name, res.description, res.templateUrl, integrationId],
      );

      // Associate GET method
      await queryRunner.query(
        `INSERT INTO resource_http_methods (resource_id, http_method_id, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (resource_id, http_method_id) DO NOTHING`,
        [inserted.id, getMethodId],
      );
    }

    // 4. Set up HATEOAS links: projects.GET → cf-types.GET, projects.GET → cf-definitions.GET
    const [projectsRhm] = await queryRunner.query(
      `SELECT rhm.id FROM resource_http_methods rhm
       JOIN resources r ON r.id = rhm.resource_id
       WHERE r.code = 'captudata-projects' AND rhm.http_method_id = $1`,
      [getMethodId],
    );

    const [cfTypesRhm] = await queryRunner.query(
      `SELECT rhm.id FROM resource_http_methods rhm
       JOIN resources r ON r.id = rhm.resource_id
       WHERE r.code = 'captudata-cf-types' AND rhm.http_method_id = $1`,
      [getMethodId],
    );

    const [cfDefsRhm] = await queryRunner.query(
      `SELECT rhm.id FROM resource_http_methods rhm
       JOIN resources r ON r.id = rhm.resource_id
       WHERE r.code = 'captudata-cf-definitions' AND rhm.http_method_id = $1`,
      [getMethodId],
    );

    // Link: projects → cf_types
    await queryRunner.query(
      `INSERT INTO resource_http_method_links (source_http_method_id, target_http_method_id, rel, param_mappings, is_active)
       VALUES ($1, $2, 'cf_types', '[]'::jsonb, true)
       ON CONFLICT DO NOTHING`,
      [projectsRhm.id, cfTypesRhm.id],
    );

    // Link: projects → cf_definitions (maps client_id from response)
    await queryRunner.query(
      `INSERT INTO resource_http_method_links (source_http_method_id, target_http_method_id, rel, param_mappings, is_active)
       VALUES ($1, $2, 'cf_definitions', $3::jsonb, true)
       ON CONFLICT DO NOTHING`,
      [
        projectsRhm.id,
        cfDefsRhm.id,
        JSON.stringify([{ responseField: 'client_id', urlParam: 'clientId' }]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove links
    await queryRunner.query(
      `DELETE FROM resource_http_method_links
       WHERE source_http_method_id IN (
         SELECT rhm.id FROM resource_http_methods rhm
         JOIN resources r ON r.id = rhm.resource_id
         WHERE r.code IN ('captudata-projects', 'captudata-cf-types', 'captudata-cf-definitions')
       )`,
    );

    // Remove resource_http_methods
    await queryRunner.query(
      `DELETE FROM resource_http_methods
       WHERE resource_id IN (
         SELECT id FROM resources WHERE code IN ('captudata-projects', 'captudata-cf-types', 'captudata-cf-definitions')
       )`,
    );

    // Remove resources
    await queryRunner.query(
      `DELETE FROM resources WHERE code IN ('captudata-projects', 'captudata-cf-types', 'captudata-cf-definitions')`,
    );

    // Remove integration
    await queryRunner.query(
      `DELETE FROM integrations WHERE code = 'captudata'`,
    );
  }
}
