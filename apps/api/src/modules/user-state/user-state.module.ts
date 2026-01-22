import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserState } from '../../entities/user-state.entity';
import { UserStateService } from './user-state.service';
import { CondominiumsModule } from '../condominiums/condominiums.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserState]),
    CondominiumsModule,
  ],
  providers: [UserStateService],
  exports: [UserStateService],
})
export class UserStateModule {}
