import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { UserStateModule } from '../user-state/user-state.module';
import { SessionContextService } from './session-context.service';

/**
 * Session Context Module
 *
 * Assembles user session context from multiple data sources.
 * Used by the gRPC layer to serve session context to the frontend.
 * Results are cached per-user via AppCacheModule (global).
 */
@Module({
  imports: [
    ConfigModule,
    UsersModule,
    UserStateModule,
  ],
  providers: [SessionContextService],
  exports: [SessionContextService],
})
export class SessionContextModule {}
