import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { CreateUserData, UserResponse } from '../../types/user';
import { hashPassword } from '../../utils/password';

/**
 * Service for user management operations
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  /**
   * Create a new user with hashed password
   *
   * @param data - User creation data
   * @param ipAddress - IP address for consent audit
   * @param userAgent - User agent for consent audit
   * @returns The created user (without password hash)
   * @throws ConflictException if email already exists
   */
  async create(
    data: CreateUserData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserResponse> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hash the password
    const passwordHash = await hashPassword(data.password);

    // Create user entity
    const user = this.usersRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      publicAccountConsent: data.publicAccountConsent,
      consentDate: new Date(),
      consentIpAddress: ipAddress,
      consentUserAgent: userAgent,
    });

    // Save to database
    const savedUser = await this.usersRepository.save(user);

    // Return user without sensitive data
    return this.toUserResponse(savedUser);
  }

  /**
   * Find a user by email
   *
   * @param email - Email to search for
   * @returns User if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find a user by ID
   *
   * @param id - User ID
   * @returns User if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  /**
   * Update last login timestamp
   *
   * @param userId - User ID
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Convert User entity to UserResponse (without sensitive data)
   *
   * Note: isSuperAdmin is intentionally not included in the response
   * to avoid exposing admin status in general API responses.
   * Use a dedicated admin endpoint to check SuperAdmin status.
   */
  toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      publicAccountConsent: user.publicAccountConsent,
      consentDate: user.consentDate,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
