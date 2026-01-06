import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtConfig } from '../../../config/env';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../token.service';

/**
 * User payload attached to request after JWT validation
 */
export interface RequestUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

/**
 * JWT Strategy for Passport
 *
 * Validates JWT tokens from Authorization header and
 * attaches user information to the request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * Validate JWT payload and return user data
   * Called automatically by Passport after token verification
   *
   * @param payload - Decoded JWT payload
   * @returns User data to attach to request
   * @throws UnauthorizedException if user not found or inactive
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    // Only accept access tokens, not refresh tokens
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token inválido');
    }

    // Verify user still exists and is active
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return {
      id: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}
