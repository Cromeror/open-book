import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';

import { UserResponse } from '../../types/user';

import { AuthService } from './auth.service';
import { RegisterDto, validateRegisterDto } from './dto/register.dto';

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
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Register user
    return this.authService.register(dto, ipAddress, userAgent);
  }
}
