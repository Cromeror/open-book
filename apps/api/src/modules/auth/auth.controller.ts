import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';

import { User } from '../../entities/user.entity';
import { UserResponse } from '../../types/user';

import { AuthService, LoginResponse, RefreshResponse, AuthMeResponse } from './auth.service';
import { CurrentUser } from './decorators';
import {
  RegisterDto,
  validateRegisterDto,
  LoginDto,
  validateLoginDto,
  RefreshDto,
  validateRefreshDto,
  LogoutDto,
  validateLogoutDto,
} from './dto';
import { JwtAuthGuard } from './guards';

/**
 * Helper to extract client info from request
 */
function getClientInfo(req: Request): { ipAddress: string; userAgent?: string } {
  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';
  const userAgent = req.headers['user-agent'];

  return { ipAddress, userAgent };
}

/**
 * Controller for authentication endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   *
   * POST /api/auth/register
   *
   * @param body - Registration data
   * @param req - Express request for IP and user agent
   * @returns Created user data (201)
   * @throws BadRequestException for validation errors (400)
   * @throws ConflictException if email exists (409)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: unknown,
    @Req() req: Request
  ): Promise<UserResponse> {
    // Validate input with Zod
    let dto: RegisterDto;
    try {
      dto = validateRegisterDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    // Get client info for consent audit
    const { ipAddress, userAgent } = getClientInfo(req);

    // Register user
    return this.authService.register(dto, ipAddress, userAgent);
  }

  /**
   * Get current authenticated user info with permissions
   *
   * GET /api/auth/me
   *
   * Requires authentication.
   *
   * @param user - Authenticated user from JWT
   * @returns User data with modules and permissions (200)
   * @throws UnauthorizedException if not authenticated (401)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User): Promise<AuthMeResponse> {
    return this.authService.getMe(user);
  }

  /**
   * Login with email and password
   *
   * POST /api/auth/login
   *
   * @param body - Login credentials
   * @param req - Express request for IP and user agent
   * @returns Access token, refresh token, and user data (200)
   * @throws BadRequestException for validation errors (400)
   * @throws UnauthorizedException for invalid credentials (401)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: unknown,
    @Req() req: Request
  ): Promise<LoginResponse> {
    // Validate input with Zod
    let dto: LoginDto;
    try {
      dto = validateLoginDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    // Get client info for audit
    const { ipAddress, userAgent } = getClientInfo(req);

    // Login
    return this.authService.login(dto.email, dto.password, ipAddress, userAgent);
  }

  /**
   * Refresh access token
   *
   * POST /api/auth/refresh
   *
   * @param body - Refresh token
   * @param req - Express request for IP and user agent
   * @returns New access token and refresh token (200)
   * @throws BadRequestException for validation errors (400)
   * @throws UnauthorizedException for invalid refresh token (401)
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: unknown,
    @Req() req: Request
  ): Promise<RefreshResponse> {
    // Validate input with Zod
    let dto: RefreshDto;
    try {
      dto = validateRefreshDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    // Get client info for audit
    const { ipAddress, userAgent } = getClientInfo(req);

    // Refresh tokens
    return this.authService.refresh(dto.refreshToken, ipAddress, userAgent);
  }

  /**
   * Logout and invalidate refresh token
   *
   * POST /api/auth/logout
   *
   * Requires authentication.
   *
   * @param body - Refresh token to invalidate
   * @param user - Authenticated user
   * @param req - Express request for IP and user agent
   * @returns 204 No Content
   * @throws BadRequestException for validation errors (400)
   * @throws UnauthorizedException if not authenticated (401)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body() body: unknown,
    @CurrentUser() user: User,
    @Req() req: Request
  ): Promise<void> {
    // Validate input with Zod
    let dto: LogoutDto;
    try {
      dto = validateLogoutDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    // Get client info for audit
    const { ipAddress, userAgent } = getClientInfo(req);

    // Logout
    await this.authService.logout(dto.refreshToken, user, ipAddress, userAgent);
  }

  /**
   * Logout from all devices
   *
   * POST /api/auth/logout-all
   *
   * Requires authentication. Invalidates all refresh tokens for the user.
   *
   * @param user - Authenticated user
   * @param req - Express request for IP and user agent
   * @returns 204 No Content
   * @throws UnauthorizedException if not authenticated (401)
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser() user: User,
    @Req() req: Request
  ): Promise<void> {
    // Get client info for audit
    const { ipAddress, userAgent } = getClientInfo(req);

    // Logout from all devices
    await this.authService.logoutAll(user, ipAddress, userAgent);
  }
}
