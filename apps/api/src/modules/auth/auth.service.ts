import { Injectable } from '@nestjs/common';

import { UserResponse } from '../../types/user';
import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';

/**
 * Service for authentication operations
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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
}
