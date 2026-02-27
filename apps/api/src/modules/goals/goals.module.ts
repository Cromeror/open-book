import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Goal } from '../../entities/goal.entity';
import { Condominium } from '../../entities/condominium.entity';
import { GoalHistory } from '../../entities/goal-history.entity';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

/**
 * Module for managing fundraising goals (Objetivos de Recaudo)
 *
 * Provides:
 * - CRUD operations for goals
 * - State machine for goal lifecycle
 * - State change history/audit trail
 * - Filtering and pagination
 *
 * Endpoints are scoped to condominiums:
 * - /api/condominiums/:condominiumId/goals/*
 *
 * Access restricted to members of the condominium (managers + residents).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Goal, Condominium, GoalHistory]),
    CondominiumsModule,
  ],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
