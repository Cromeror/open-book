import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthLog, AuthEvent } from '../../entities';

/**
 * Data for creating an auth log entry
 */
export interface CreateAuthLogDto {
  userId?: string | null;
  event: AuthEvent;
  email: string;
  ipAddress: string;
  userAgent?: string | null;
  success: boolean;
  failReason?: string | null;
}

/**
 * Service for authentication audit logging
 *
 * Logs all authentication events for:
 * - Security monitoring
 * - Compliance (trazabilidad)
 * - Suspicious activity detection
 */
@Injectable()
export class AuthLogService {
  constructor(
    @InjectRepository(AuthLog)
    private readonly authLogRepository: Repository<AuthLog>
  ) {}

  /**
   * Log an authentication event
   */
  async logEvent(data: CreateAuthLogDto): Promise<AuthLog> {
    const log = this.authLogRepository.create({
      userId: data.userId,
      event: data.event,
      email: data.email,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      success: data.success,
      failReason: data.failReason,
    });

    return this.authLogRepository.save(log);
  }

  /**
   * Log successful login
   */
  async logLogin(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthLog> {
    return this.logEvent({
      userId,
      event: AuthEvent.LOGIN,
      email,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log failed login attempt
   */
  async logFailedLogin(
    email: string,
    ipAddress: string,
    failReason: string,
    userAgent?: string,
    userId?: string
  ): Promise<AuthLog> {
    return this.logEvent({
      userId,
      event: AuthEvent.LOGIN_FAILED,
      email,
      ipAddress,
      userAgent,
      success: false,
      failReason,
    });
  }

  /**
   * Log logout
   */
  async logLogout(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthLog> {
    return this.logEvent({
      userId,
      event: AuthEvent.LOGOUT,
      email,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log token refresh
   */
  async logRefresh(
    userId: string,
    email: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthLog> {
    return this.logEvent({
      userId,
      event: AuthEvent.REFRESH,
      email,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Get recent auth logs for a user
   */
  async getRecentLogsForUser(
    userId: string,
    limit: number = 10
  ): Promise<AuthLog[]> {
    return this.authLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get failed login attempts for an email (for rate limiting)
   */
  async getRecentFailedAttempts(
    email: string,
    minutes: number = 15
  ): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const count = await this.authLogRepository.count({
      where: {
        email,
        event: AuthEvent.LOGIN_FAILED,
        createdAt: since,
      },
    });

    return count;
  }
}
