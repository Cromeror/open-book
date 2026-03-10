import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resource } from '../../entities/resource.entity';
import { ExternalUser } from '../../entities/external-user.entity';
import { ExternalUserPermission } from '../../entities/external-user-permission.entity';
import { ExternalPoolMember } from '../../entities/external-pool-member.entity';
import { ExternalUserResourceAccess } from '../../entities/external-user-resource-access.entity';
import { PoolPermission } from '../../entities/pool-permission.entity';
import { PoolResourceAccess } from '../../entities/pool-resource-access.entity';

import { ExternalProxyController } from './external-proxy.controller';
import { ExternalProxyService } from './external-proxy.service';
import { ResourceMatcherService } from './resource-matcher.service';
import { ExternalAuthStrategyFactory } from './auth-strategies';
import { ExternalPermissionsService } from './external-permissions.service';
import { ExternalAuthGuard } from './guards/external-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      ExternalUser,
      ExternalUserPermission,
      ExternalPoolMember,
      ExternalUserResourceAccess,
      PoolPermission,
      PoolResourceAccess,
    ]),
  ],
  controllers: [ExternalProxyController],
  providers: [
    ExternalProxyService,
    ResourceMatcherService,
    ExternalAuthStrategyFactory,
    ExternalPermissionsService,
    ExternalAuthGuard,
  ],
})
export class ExternalProxyModule {}
