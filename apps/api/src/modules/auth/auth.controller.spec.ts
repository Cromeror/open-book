/**
 * AuthController Integration Tests
 *
 * Tests for authentication endpoints: login, register, refresh, logout.
 * These tests require a running test database.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from '../../app/app.module';
import { User } from '../../entities/user.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { createUser, DEFAULT_TEST_PASSWORD } from '../../../test/factories';

// TODO: Fix integration test - currently times out loading AppModule
// The issue is likely related to TypeORM connection conflicts between
// the global test setup and NestJS module initialization
describe.skip('AuthController (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  }, 60000); // Increase timeout for integration tests

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await dataSource.getRepository(RefreshToken).delete({});
    await dataSource.getRepository(User).delete({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'newuser@test.com',
        password: 'SecurePass123!',
        firstName: 'Juan',
        lastName: 'Perez',
        consentAccountStatement: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(registerData.email);
      expect(response.body.firstName).toBe(registerData.firstName);
      expect(response.body.lastName).toBe(registerData.lastName);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          firstName: 'Juan',
          lastName: 'Perez',
          consentAccountStatement: true,
        })
        .expect(400);

      expect(response.body.message).toBe('Error de validación');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: '123',
          firstName: 'Juan',
          lastName: 'Perez',
          consentAccountStatement: true,
        })
        .expect(400);

      expect(response.body.message).toBe('Error de validación');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
        })
        .expect(400);

      expect(response.body.message).toBe('Error de validación');
    });

    it('should return 409 for duplicate email', async () => {
      // First create a user
      const existingUser = await createUser({ email: 'existing@test.com' });
      await dataSource.getRepository(User).save(existingUser);

      // Try to register with same email
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'existing@test.com',
          password: 'SecurePass123!',
          firstName: 'Juan',
          lastName: 'Perez',
          consentAccountStatement: true,
        })
        .expect(409);

      expect(response.body.message).toContain('existe');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await createUser({
        email: 'login@test.com',
        password: DEFAULT_TEST_PASSWORD,
      });
      await dataSource.getRepository(User).save(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: DEFAULT_TEST_PASSWORD,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('login@test.com');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(response.body.message).toContain('Credenciales');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: DEFAULT_TEST_PASSWORD,
        })
        .expect(401);

      expect(response.body.message).toContain('Credenciales');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: DEFAULT_TEST_PASSWORD,
        })
        .expect(400);

      expect(response.body.message).toBe('Error de validación');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
        })
        .expect(400);

      expect(response.body.message).toBe('Error de validación');
    });

    it('should return 401 for inactive user', async () => {
      const inactiveUser = await createUser({
        email: 'inactive@test.com',
        password: DEFAULT_TEST_PASSWORD,
        isActive: false,
      });
      await dataSource.getRepository(User).save(inactiveUser);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'inactive@test.com',
          password: DEFAULT_TEST_PASSWORD,
        })
        .expect(401);

      expect(response.body.message).toContain('desactivada');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser: User;
    let refreshToken: string;

    beforeEach(async () => {
      testUser = await createUser({
        email: 'refresh@test.com',
        password: DEFAULT_TEST_PASSWORD,
      });
      await dataSource.getRepository(User).save(testUser);

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'refresh@test.com',
          password: DEFAULT_TEST_PASSWORD,
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.refreshToken).not.toBe(refreshToken);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Error de validación');
    });

    it('should invalidate old refresh token after use', async () => {
      // Use the refresh token
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Try to use the same token again
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser: User;
    let accessToken: string;

    beforeEach(async () => {
      testUser = await createUser({
        email: 'me@test.com',
        password: DEFAULT_TEST_PASSWORD,
        isSuperAdmin: true,
      });
      await dataSource.getRepository(User).save(testUser);

      // Login to get access token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'me@test.com',
          password: DEFAULT_TEST_PASSWORD,
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should return current user info with permissions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('me@test.com');
      expect(response.body.user.isSuperAdmin).toBe(true);
      expect(response.body).toHaveProperty('modules');
      expect(response.body).toHaveProperty('permissions');
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser: User;
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      testUser = await createUser({
        email: 'logout@test.com',
        password: DEFAULT_TEST_PASSWORD,
      });
      await dataSource.getRepository(User).save(testUser);

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'logout@test.com',
          password: DEFAULT_TEST_PASSWORD,
        });

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    it('should logout successfully', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(204);
    });

    it('should invalidate refresh token after logout', async () => {
      // Logout
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(204);

      // Try to use the refresh token
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('POST /api/auth/logout-all', () => {
    let testUser: User;
    let accessToken: string;
    let refreshToken1: string;
    let refreshToken2: string;

    beforeEach(async () => {
      testUser = await createUser({
        email: 'logoutall@test.com',
        password: DEFAULT_TEST_PASSWORD,
      });
      await dataSource.getRepository(User).save(testUser);

      // Login twice to get multiple refresh tokens
      const loginResponse1 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'logoutall@test.com',
          password: DEFAULT_TEST_PASSWORD,
        });

      const loginResponse2 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'logoutall@test.com',
          password: DEFAULT_TEST_PASSWORD,
        });

      accessToken = loginResponse2.body.accessToken;
      refreshToken1 = loginResponse1.body.refreshToken;
      refreshToken2 = loginResponse2.body.refreshToken;
    });

    it('should logout from all devices', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should invalidate all refresh tokens after logout-all', async () => {
      // Logout from all devices
      await request(app.getHttpServer())
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Try to use first refresh token
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshToken1 })
        .expect(401);

      // Try to use second refresh token
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshToken2 })
        .expect(401);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout-all')
        .expect(401);
    });
  });
});
