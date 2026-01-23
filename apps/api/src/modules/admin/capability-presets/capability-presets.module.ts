import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityPreset } from '../../../entities/capability-preset.entity';
import { CapabilityPresetsController } from './capability-presets.controller';
import { CapabilityPresetsService } from './capability-presets.service';

@Module({
  imports: [TypeOrmModule.forFeature([CapabilityPreset])],
  controllers: [CapabilityPresetsController],
  providers: [CapabilityPresetsService],
  exports: [CapabilityPresetsService],
})
export class CapabilityPresetsModule {}
