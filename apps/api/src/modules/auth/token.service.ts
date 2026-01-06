import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as crypto from 'crypto';

import { RefreshToken, User } from '../../entities';
import { jwtConfig } from '../../config/env';

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  isSuperAdmin: boolean;
  type: 'access' | 'refresh';
}

/**
 * Token pair returned on login/refresh
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Service for JWT token operations
 *
 * Handles:
 * - Access token generation (short-lived)
 * - Refresh token generation and storage (long-lived)
 * - Token validation
 * - Token rotation
 * - Token revocation
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  /**
   * Generate access token for user
   */
  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiresInSeconds,
    });
  }

  /**
   * Generate refresh token and store in database
   */
  async generateRefreshToken(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    // Generate random token
    const tokenValue = crypto.randomBytes(64).toString('hex');

    // Calculate expiration using seconds from config
    const expiresAt = new Date(Date.now() + jwtConfig.refreshExpiresInSeconds * 1000);

    // Hash token for storage (we only store hash, not the actual token)
    const hashedToken = this.hashToken(tokenValue);

    // Create and save refresh token
    const refreshToken = this.refreshTokenRepository.create({
      token: hashedToken,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return tokenValue;
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(
      user,
      ipAddress,
      userAgent
    );

    return { accessToken, refreshToken };
  }

  /**
   * Validate refresh token and return associated user ID
   * Implements token rotation - old token is revoked
   */
  async validateRefreshToken(tokenValue: string): Promise<string | null> {
    const hashedToken = this.hashToken(tokenValue);

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: hashedToken },
    });

    if (!refreshToken) {
      return null;
    }

    // Check if token is valid
    if (!refreshToken.isValid) {
      return null;
    }

    // Revoke the used token (rotation)
    refreshToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(refreshToken);

    return refreshToken.userId;
  }

  /**
   * Revoke a specific refresh token (logout)
   */
  async revokeRefreshToken(tokenValue: string): Promise<boolean> {
    const hashedToken = this.hashToken(tokenValue);

    const result = await this.refreshTokenRepository.update(
      { token: hashedToken, revokedAt: undefined },
      { revokedAt: new Date() }
    );

    return (result.affected ?? 0) > 0;
  }

  /**
   * Revoke all refresh tokens for a user (security - logout everywhere)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: undefined },
      { revokedAt: new Date() }
    );
  }

  /**
   * Clean up expired tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected ?? 0;
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      if (payload.type !== 'access') {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Hash token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
