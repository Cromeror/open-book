import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { jwtConfig } from '../../config/env';
import { AuthLog } from '../../entities/auth-log.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CondominiumsModule } from '../admin/condominiums/condominiums.module';

import { AuthLogService } from './auth-log.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './token.service';

/**
 * Authentication module
 *
 * Provides:
 * - User registration and login
 * - JWT access token generation and validation
 * - Refresh token rotation
 * - Logout (single and all devices)
 * - Authentication audit logging
 * - User modules, permissions, and condominiums via /api/auth/me
 */
@Module({
  imports: [
    UsersModule,
    PermissionsModule,
    CondominiumsModule, // For CondominiumManagersService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.accessExpiresInSeconds,
      },
    }),
    TypeOrmModule.forFeature([RefreshToken, AuthLog]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    AuthLogService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, TokenService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
