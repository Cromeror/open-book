import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module as ModuleEntity } from '../../../entities';
import { ModulePermission } from '../../../entities/module-permission.entity';

import { AdminModulesController } from './admin-modules.controller';
import { AdminModulesService } from './admin-modules.service';

/**
 * Admin Modules module for system module management (SuperAdmin only)
 *
 * Provides:
 * - Create new system modules
 * - List all system modules
 * - Update module configuration (name, icon, order, etc.)
 * - Toggle module active/inactive status
 *
 * Endpoints at /api/admin/modules
 */
@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity, ModulePermission])],
  controllers: [AdminModulesController],
  providers: [AdminModulesService],
  exports: [AdminModulesService],
})
export class AdminModulesModule {}
