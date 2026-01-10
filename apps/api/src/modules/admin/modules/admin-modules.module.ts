import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module as ModuleEntity } from '../../../entities';

import { AdminModulesController } from './admin-modules.controller';
import { AdminModulesService } from './admin-modules.service';

/**
 * Admin Modules module for system module management (SuperAdmin only)
 *
 * Provides:
 * - List all system modules
 * - Update module configuration (name, icon, order, etc.)
 * - Toggle module active/inactive status
 *
 * Endpoints at /api/admin/modules
 */
@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity])],
  controllers: [AdminModulesController],
  providers: [AdminModulesService],
  exports: [AdminModulesService],
})
export class AdminModulesModule {}
