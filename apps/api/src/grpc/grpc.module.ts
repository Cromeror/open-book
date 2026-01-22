import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { jwtConfig } from '../config/env';
import { AuthModule } from '../modules/auth/auth.module';
import { CondominiumsModule } from '../modules/condominiums/condominiums.module';
import { CondominiumsModule as AdminCondominiumsModule } from '../modules/admin/condominiums/condominiums.module';
import { PermissionsModule } from '../modules/permissions/permissions.module';

import { CondominiumsGrpcController } from './controllers/condominiums.grpc-controller';
import { GrpcJwtAuthGuard } from './guards/grpc-jwt-auth.guard';
import { GrpcPermissionsGuard } from './guards/grpc-permissions.guard';
import { GrpcExceptionFilter } from './filters/grpc-exception.filter';

/**
 * gRPC Module
 *
 * This module configures the gRPC server and its dependencies.
 * It imports existing HTTP modules to reuse their services and guards.
 *
 * Architecture:
 * - Controllers: gRPC endpoints (thin wrappers around services)
 * - Guards: Authentication and authorization adapters
 * - Filters: Exception handling and error translation
 * - Imported Modules: Provide services and authentication infrastructure
 *
 * Key Design Principles:
 * 1. Maximum Code Reuse: Import existing modules, don't duplicate services
 * 2. Thin Controllers: Only handle gRPC-specific concerns (metadata, protobuf)
 * 3. Shared Guards: Adapt existing guards to work with gRPC context
 * 4. Consistent Behavior: Same business logic, validation, and errors as HTTP
 *
 * Module Dependencies:
 * - AuthModule: Provides JwtStrategy, TokenService, UsersService
 * - CondominiumsModule: Provides CondominiumsService (business logic)
 * - PermissionsModule: Provides PermissionsService (RBAC)
 * - JwtModule: Provides JwtService for token verification
 */
@Module({
  imports: [
    // Import HTTP modules to reuse their services
    AuthModule, // For JwtStrategy, TokenService, UsersService
    CondominiumsModule, // For user CondominiumsService
    AdminCondominiumsModule, // For admin CondominiumsService + ManagersService
    PermissionsModule, // For PermissionsService
    // JwtModule with same configuration as AuthModule (must have secret to verify tokens)
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.accessExpiresInSeconds,
      },
    }),
  ],

  // gRPC controllers (implement proto service definitions)
  controllers: [
    CondominiumsGrpcController,
    // Add more gRPC controllers here as needed:
    // PropertiesGrpcController,
    // GoalsGrpcController,
    // etc.
  ],

  // gRPC-specific providers (guards, filters)
  providers: [
    GrpcJwtAuthGuard, // Validates JWT from gRPC metadata
    GrpcPermissionsGuard, // Validates permissions from decorators
    GrpcExceptionFilter, // Converts NestJS exceptions to gRPC errors
  ],

  // Export guards and filters if other modules need them
  exports: [GrpcJwtAuthGuard, GrpcPermissionsGuard, GrpcExceptionFilter],
})
export class GrpcModule {}
