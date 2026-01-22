import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Metadata } from '@grpc/grpc-js';

import { JwtStrategy } from '../../modules/auth/strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';
import { JwtPayload } from '../../modules/auth/token.service';

/**
 * gRPC JWT Authentication Guard
 *
 * This guard is an adapter that extracts JWT tokens from gRPC metadata
 * and delegates validation to the existing JwtStrategy.
 *
 * Flow:
 * 1. Extract JWT from gRPC metadata (authorization: Bearer <token>)
 * 2. Verify JWT signature and expiration using JwtService
 * 3. Call JwtStrategy.validate() to check user exists and is active
 * 4. Attach user to gRPC context for use in controllers
 *
 * This ensures 100% code reuse with HTTP authentication:
 * - Same JWT validation logic
 * - Same user validation logic
 * - Same @Public() decorator support
 */
@Injectable()
export class GrpcJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for @Public() decorator (same behavior as HTTP)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Extract metadata from gRPC context
    const metadata = this.getMetadataFromContext(context);
    const token = this.extractTokenFromMetadata(metadata);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify JWT token (signature and expiration)
      const payload = this.jwtService.verify<JwtPayload>(token);

      // Validate user using existing JwtStrategy
      // This checks:
      // - Token type is 'access' (not 'refresh')
      // - User exists in database
      // - User is active
      const user = await this.jwtStrategy.validate(payload);

      // Attach user to gRPC call context
      const rpcContext = context.switchToRpc().getContext();
      rpcContext.user = user;

      return true;
    } catch (error) {
      // Handle JWT verification errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // JWT verification failed (expired, invalid signature, etc.)
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extract metadata from gRPC context
   *
   * In NestJS gRPC with @GrpcMethod decorator, the metadata is passed as the second
   * argument to the handler method. In the guard context, we extract it from
   * the execution context arguments.
   *
   * The metadata is available in the handler arguments at index 1 (args[1]).
   */
  private getMetadataFromContext(context: ExecutionContext): Metadata {
    // Get the handler arguments
    // For @GrpcMethod: args[0] = request data, args[1] = metadata, args[2] = call
    const args = context.getArgs();

    console.log('[GrpcJwtAuthGuard] Extracting metadata from handler arguments...');
    console.log('[GrpcJwtAuthGuard] args length:', args.length);
    console.log('[GrpcJwtAuthGuard] args[1] type:', args[1]?.constructor?.name);

    // The metadata should be at index 1
    if (args.length > 1 && args[1]) {
      const metadata = args[1] as Metadata;
      console.log('[GrpcJwtAuthGuard] Metadata extracted from args[1]');
      console.log('[GrpcJwtAuthGuard] Metadata keys:', metadata.getMap ? Object.keys(metadata.getMap()) : 'N/A');
      return metadata;
    }

    console.log('[GrpcJwtAuthGuard] No metadata found in args, returning empty Metadata');
    return new Metadata();
  }

  /**
   * Extract JWT token from authorization metadata
   * Expected format: "Bearer <token>"
   */
  private extractTokenFromMetadata(metadata: Metadata): string | null {
    const authHeader = metadata.get('authorization')[0];

    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    // Split "Bearer <token>"
    const parts = authHeader.split(' ');
    const scheme = parts[0];
    const token = parts[1];

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }
}
