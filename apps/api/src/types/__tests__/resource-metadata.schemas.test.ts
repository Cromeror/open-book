/**
 * Tests for resource metadata schemas
 *
 * Verifies that Zod validation schemas correctly validate
 * payload and response metadata structures.
 */

import { describe, it, expect } from 'vitest';
import {
  validatePayloadMetadata,
  validateResponseMetadata,
  validatePropertySchema,
  safeParsePayloadMetadata,
  safeParseResponseMetadata,
  extractValidationErrors,
} from '../resource-metadata.schemas';
import type {
  PayloadMetadata,
  ResponseMetadata,
  PropertySchema,
} from '../resource-metadata.types';

describe('Resource Metadata Schemas', () => {
  describe('PropertySchema', () => {
    it('should validate a simple string property', () => {
      const schema: PropertySchema = {
        type: 'string',
        minLength: 3,
        maxLength: 200,
        description: 'Goal name',
      };

      expect(() => validatePropertySchema(schema)).not.toThrow();
    });

    it('should validate a number property with constraints', () => {
      const schema: PropertySchema = {
        type: 'number',
        minimum: 0,
        maximum: 9999999,
        description: 'Target amount',
      };

      expect(() => validatePropertySchema(schema)).not.toThrow();
    });

    it('should validate an object with nested properties', () => {
      const schema: PropertySchema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          amount: { type: 'number', minimum: 0 },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      };

      expect(() => validatePropertySchema(schema)).not.toThrow();
    });

    it('should validate an array with item schema', () => {
      const schema: PropertySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        minItems: 0,
        maxItems: 100,
      };

      expect(() => validatePropertySchema(schema)).not.toThrow();
    });

    it('should reject invalid type', () => {
      const schema = {
        type: 'invalid',
      };

      expect(() => validatePropertySchema(schema)).toThrow();
    });
  });

  describe('PayloadMetadata - GET Request', () => {
    it('should validate GET request with query parameters', () => {
      const metadata: PayloadMetadata = {
        method: 'GET',
        summary: 'List all goals',
        parameters: [
          {
            name: 'condominiumId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
      };

      expect(() => validatePayloadMetadata(metadata)).not.toThrow();
    });

    it('should validate GET request without parameters', () => {
      const metadata: PayloadMetadata = {
        method: 'GET',
        summary: 'Get current user',
      };

      expect(() => validatePayloadMetadata(metadata)).not.toThrow();
    });
  });

  describe('PayloadMetadata - POST Request', () => {
    it('should validate POST request with body', () => {
      const metadata: PayloadMetadata = {
        method: 'POST',
        summary: 'Create a new goal',
        parameters: [
          {
            name: 'condominiumId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 3, maxLength: 200 },
              description: { type: 'string', nullable: true },
              targetAmount: { type: 'number', minimum: 0.01 },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time', nullable: true },
            },
          },
          examples: {
            basic: {
              summary: 'Basic goal',
              value: {
                name: 'Remodelación del Lobby',
                targetAmount: 50000000,
                startDate: '2026-01-01T00:00:00Z',
              },
            },
          },
        },
      };

      expect(() => validatePayloadMetadata(metadata)).not.toThrow();
    });

    it('should reject POST request with invalid contentType', () => {
      const metadata = {
        method: 'POST',
        requestBody: {
          required: true,
          contentType: 'invalid',
          schema: { type: 'object' },
        },
      };

      expect(() => validatePayloadMetadata(metadata)).toThrow();
    });
  });

  describe('PayloadMetadata - PATCH Request', () => {
    it('should validate PATCH request with optional fields', () => {
      const metadata: PayloadMetadata = {
        method: 'PATCH',
        summary: 'Partially update a goal',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          contentType: 'application/json',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string', minLength: 3 },
              targetAmount: { type: 'number', minimum: 0.01 },
            },
          },
        },
      };

      expect(() => validatePayloadMetadata(metadata)).not.toThrow();
    });
  });

  describe('PayloadMetadata - DELETE Request', () => {
    it('should validate DELETE request', () => {
      const metadata: PayloadMetadata = {
        method: 'DELETE',
        summary: 'Delete a goal',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
      };

      expect(() => validatePayloadMetadata(metadata)).not.toThrow();
    });
  });

  describe('ResponseMetadata', () => {
    it('should validate successful GET response', () => {
      const metadata: ResponseMetadata = {
        method: 'GET',
        success: {
          statusCode: 200,
          description: 'Successfully retrieved goals',
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    targetAmount: { type: 'number' },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  total: { type: 'integer' },
                },
              },
            },
          },
        },
        includeHateoasLinks: true,
      };

      expect(() => validateResponseMetadata(metadata)).not.toThrow();
    });

    it('should validate POST 201 response with Location header', () => {
      const metadata: ResponseMetadata = {
        method: 'POST',
        success: {
          statusCode: 201,
          description: 'Goal created successfully',
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
          headers: {
            Location: {
              description: 'URI of created resource',
              schema: { type: 'string', format: 'uri' },
            },
          },
        },
      };

      expect(() => validateResponseMetadata(metadata)).not.toThrow();
    });

    it('should validate DELETE 204 response', () => {
      const metadata: ResponseMetadata = {
        method: 'DELETE',
        success: {
          statusCode: 204,
          description: 'Goal deleted successfully',
          contentType: 'application/json',
        },
        includeHateoasLinks: false,
      };

      expect(() => validateResponseMetadata(metadata)).not.toThrow();
    });

    it('should reject invalid status code (< 200)', () => {
      const metadata = {
        method: 'GET',
        success: {
          statusCode: 199,
          contentType: 'application/json',
        },
      };

      expect(() => validateResponseMetadata(metadata)).toThrow();
    });

    it('should reject invalid status code (>= 300)', () => {
      const metadata = {
        method: 'GET',
        success: {
          statusCode: 300,
          contentType: 'application/json',
        },
      };

      expect(() => validateResponseMetadata(metadata)).toThrow();
    });
  });

  describe('Safe Parse Functions', () => {
    it('should return success for valid payload metadata', () => {
      const metadata: PayloadMetadata = {
        method: 'GET',
        summary: 'Test',
      };

      const result = safeParsePayloadMetadata(metadata);
      expect(result.success).toBe(true);
    });

    it('should return error for invalid payload metadata', () => {
      const metadata = {
        method: 'INVALID',
      };

      const result = safeParsePayloadMetadata(metadata);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should return success for valid response metadata', () => {
      const metadata: ResponseMetadata = {
        method: 'GET',
        success: {
          statusCode: 200,
          contentType: 'application/json',
        },
      };

      const result = safeParseResponseMetadata(metadata);
      expect(result.success).toBe(true);
    });

    it('should return error for invalid response metadata', () => {
      const metadata = {
        method: 'GET',
        success: {
          statusCode: 400, // Invalid: must be 2xx
          contentType: 'application/json',
        },
      };

      const result = safeParseResponseMetadata(metadata);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should extract error messages correctly', () => {
      const metadata = {
        method: 'INVALID',
        parameters: [
          {
            name: '',
            in: 'invalid',
          },
        ],
      };

      const result = safeParsePayloadMetadata(metadata);
      if (!result.success) {
        const errors = extractValidationErrors(result.error);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.includes('method'))).toBe(true);
      }
    });
  });

  describe('Complex Nested Schemas', () => {
    it('should validate deeply nested object structure', () => {
      const metadata: PayloadMetadata = {
        method: 'POST',
        requestBody: {
          required: true,
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  profile: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      addresses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            street: { type: 'string' },
                            city: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      expect(() => validatePayloadMetadata(metadata)).not.toThrow();
    });
  });
});
