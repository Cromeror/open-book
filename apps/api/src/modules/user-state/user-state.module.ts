import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserState } from '../../entities/user-state.entity';
import { UserStateService } from './user-state.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserState]),
  ],
  providers: [UserStateService],
  exports: [UserStateService],
})
export class UserStateModule {}
