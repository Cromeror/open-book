import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { CondominiumManager } from '../../../entities/condominium-manager.entity';
import { Property } from '../../../entities/property.entity';
import { PropertyResident } from '../../../entities/property-resident.entity';
import { RequestUser } from '../../auth/strategies/jwt.strategy';

/**
 * Guard that verifies the authenticated user belongs to the condominium
 * specified in the :condominiumId route parameter.
 *
 * A user belongs to a condominium if they are:
 * 1. An active manager in condominium_managers, OR
 * 2. An active resident of any property that belongs to that condominium
 *
 * SuperAdmins bypass this check.
 */
@Injectable()
export class CondominiumMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(CondominiumManager)
    private readonly managerRepository: Repository<CondominiumManager>,
    @InjectRepository(PropertyResident)
    private readonly residentRepository: Repository<PropertyResident>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as RequestUser;
    const condominiumId = req.params['condominiumId'];

    if (!user || !condominiumId) return false;

    // SuperAdmins can access any condominium
    if (user.isSuperAdmin) return true;

    const isMember = await this.isMemberOfCondominium(user.id, condominiumId);
    if (!isMember) {
      throw new ForbiddenException('No tienes acceso a este condominio');
    }

    return true;
  }

  private async isMemberOfCondominium(
    userId: string,
    condominiumId: string,
  ): Promise<boolean> {
    // Check manager membership
    const asManager = await this.managerRepository.findOne({
      where: { userId, condominiumId, isActive: true },
    });
    if (asManager) return true;

    // Check resident membership via property → condominium
    const asResident = await this.residentRepository
      .createQueryBuilder('pr')
      .innerJoin('pr.property', 'p')
      .where('pr.userId = :userId', { userId })
      .andWhere('p.condominiumId = :condominiumId', { condominiumId })
      .andWhere('pr.status = :status', { status: 'ACTIVE' })
      .andWhere('pr.deletedAt IS NULL')
      .getOne();

    return !!asResident;
  }
}
