import { Injectable, UnauthorizedException } from '@nestjs/common';

import { User } from '../../entities/user.entity';
import { UserResponse } from '../../types/user';
import { comparePassword } from '../../utils/password';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../permissions/permissions.service';
import type { ModuleWithActions } from '../../types/module-actions.types';

import { AuthLogService } from './auth-log.service';
import { RegisterDto } from './dto/register.dto';
import { TokenService } from './token.service';

/**
 * Login response with tokens and user data
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

/**
 * Refresh response with new tokens
 */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth me response with user info and modules with segregated actions
 * Used by frontend to verify authentication and load permissions
 */
export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleWithActions[];
}

/**
 * Service for authentication operations
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly authLogService: AuthLogService,
    private readonly permissionsService: PermissionsService
  ) {}

  /**
   * Get current authenticated user info with modules and segregated actions
   *
   * Returns user data along with modules the user has access to.
   * Each module includes only the actions the user has permission for.
   * Action code = Permission code (e.g., 'read', 'create', 'update', 'delete')
   *
   * @param user - Authenticated user from JWT validation
   * @returns User data with modules and their allowed actions
   */
  async getMe(user: User): Promise<AuthMeResponse> {
    // Map user to response format
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
    };

    // Get modules with segregated actions for the user
    // SuperAdmin receives all modules with all actions
    // Regular users receive only modules they have access to with only allowed actions
    const modules = await this.permissionsService.getModulesWithActionsForUser(user.id);

    return {
      user: userResponse,
      modules,
    };
  }

  /**
   * Register a new user
   *
   * @param dto - Registration data (validated)
   * @param ipAddress - Client IP for consent audit
   * @param userAgent - Client user agent for consent audit
   * @returns Created user data (without password)
   */
  async register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserResponse> {
    return this.usersService.create(
      {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone ?? undefined,
        publicAccountConsent: dto.publicAccountConsent,
      },
      ipAddress,
      userAgent
    );
  }

  /**
   * Authenticate user with email and password
   *
   * @param email - User email
   * @param password - User password
   * @param ipAddress - Client IP for audit
   * @param userAgent - Client user agent for audit
   * @returns Tokens and user data
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<LoginResponse> {
    // Find user by email
    const user = await this.usersService.findByEmail(email);

    // Generic error message to avoid revealing if email exists
    const genericError = 'Credenciales inválidas';

    // User not found - log failed attempt
    if (!user) {
      await this.authLogService.logFailedLogin(
        email,
        ipAddress,
        'Usuario no encontrado',
        userAgent
      );
      throw new UnauthorizedException(genericError);
    }

    // Check if user is active
    if (!user.isActive) {
      await this.authLogService.logFailedLogin(
        email,
        ipAddress,
        'Usuario inactivo',
        userAgent,
        user.id
      );
      throw new UnauthorizedException(genericError);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.authLogService.logFailedLogin(
        email,
        ipAddress,
        'Contraseña incorrecta',
        userAgent,
        user.id
      );
      throw new UnauthorizedException(genericError);
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      user,
      ipAddress,
      userAgent
    );

    // Update last login and log success
    await this.usersService.updateLastLogin(user.id);
    await this.authLogService.logLogin(user.id, user.email, ipAddress, userAgent);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.usersService.toUserResponse(user),
    };
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Valid refresh token
   * @param ipAddress - Client IP for audit
   * @param userAgent - Client user agent for audit
   * @returns New token pair
   * @throws UnauthorizedException if refresh token is invalid
   */
  async refresh(
    refreshToken: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<RefreshResponse> {
    // Validate refresh token and get user ID
    const userId = await this.tokenService.validateRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    // Get user
    const user = await this.usersService.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    // Generate new tokens
    const tokens = await this.tokenService.generateTokenPair(
      user,
      ipAddress,
      userAgent
    );

    // Log refresh
    await this.authLogService.logRefresh(user.id, user.email, ipAddress, userAgent);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Logout user by invalidating refresh token
   *
   * @param refreshToken - Refresh token to invalidate
   * @param user - Authenticated user
   * @param ipAddress - Client IP for audit
   * @param userAgent - Client user agent for audit
   */
  async logout(
    refreshToken: string,
    user: User,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    // Revoke the refresh token
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Log logout
    await this.authLogService.logLogout(user.id, user.email, ipAddress, userAgent);
  }

  /**
   * Logout user from all devices by invalidating all refresh tokens
   *
   * @param user - Authenticated user
   * @param ipAddress - Client IP for audit
   * @param userAgent - Client user agent for audit
   */
  async logoutAll(
    user: User,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    // Revoke all refresh tokens
    await this.tokenService.revokeAllUserTokens(user.id);

    // Log logout
    await this.authLogService.logLogout(user.id, user.email, ipAddress, userAgent);
  }
}
