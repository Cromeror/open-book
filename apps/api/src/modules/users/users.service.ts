import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { CreateUserData, UserResponse, AdminUserResponse } from '../../types/user';
import { hashPassword } from '../../utils/password';

/**
 * Query options for listing users
 */
export interface FindAllUsersOptions {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  orderBy?: 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt';
  order?: 'asc' | 'desc';
}

/**
 * Paginated response for user listing
 */
export interface PaginatedUsersResponse {
  data: AdminUserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

  /**
   * Convert User entity to AdminUserResponse (includes admin-only fields)
   */
  toAdminUserResponse(user: User): AdminUserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      publicAccountConsent: user.publicAccountConsent,
      consentDate: user.consentDate,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Find all users with pagination and filtering (SuperAdmin only)
   *
   * @param options - Query options
   * @returns Paginated list of users
   */
  async findAll(options: FindAllUsersOptions): Promise<PaginatedUsersResponse> {
    const {
      search,
      isActive,
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      order = 'asc',
    } = options;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply active filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Apply ordering
    const orderColumn = `user.${orderBy}`;
    queryBuilder.orderBy(orderColumn, order.toUpperCase() as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const users = await queryBuilder.getMany();

    return {
      data: users.map((user) => this.toAdminUserResponse(user)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a user by ID with admin-level details
   *
   * @param id - User ID
   * @returns User with admin fields if found, null otherwise
   */
  async findByIdForAdmin(id: string): Promise<AdminUserResponse | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.toAdminUserResponse(user);
  }

  /**
   * Create a new user by admin (SuperAdmin only)
   *
   * @param data - User creation data
   * @returns The created user
   * @throws ConflictException if email already exists
   */
  async createByAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<AdminUserResponse> {
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
      publicAccountConsent: false,
      isActive: true,
    });

    // Save to database
    const savedUser = await this.usersRepository.save(user);

    return this.toAdminUserResponse(savedUser);
  }

  /**
   * Update a user by admin (SuperAdmin only)
   *
   * @param id - User ID
   * @param data - Fields to update
   * @returns Updated user
   */
  async updateByAdmin(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      isActive?: boolean;
    },
  ): Promise<AdminUserResponse | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    // Update fields
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    const savedUser = await this.usersRepository.save(user);

    return this.toAdminUserResponse(savedUser);
  }

  /**
   * Delete (soft) a user by admin (SuperAdmin only)
   *
   * @param id - User ID
   * @returns true if deleted, false if not found
   */
  async deleteByAdmin(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      return false;
    }

    // Soft delete: deactivate the user
    user.isActive = false;
    await this.usersRepository.save(user);

    return true;
  }
}
