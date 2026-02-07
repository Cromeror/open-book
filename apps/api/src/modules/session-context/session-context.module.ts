import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { UserStateModule } from '../user-state/user-state.module';
import { CondominiumsModule } from '../condominiums/condominiums.module';
import { SessionContextService } from './session-context.service';

/**
 * Session Context Module
 *
 * Assembles user session context from multiple data sources.
 * Used by the gRPC layer to serve session context to the frontend.
 */
@Module({
  imports: [
    UsersModule,
    UserStateModule,
    CondominiumsModule,
  ],
  providers: [SessionContextService],
  exports: [SessionContextService],
})
export class SessionContextModule {}
