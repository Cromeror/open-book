import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Integration } from '../../../entities/integration.entity';
import { AdminIntegrationsController } from './integrations.controller';
import { AdminIntegrationsService } from './integrations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Integration])],
  controllers: [AdminIntegrationsController],
  providers: [AdminIntegrationsService],
  exports: [AdminIntegrationsService],
})
export class AdminIntegrationsModule {}
