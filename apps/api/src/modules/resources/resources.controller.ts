import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards';

import { ResourcesService } from './resources.service';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  /**
   * GET /api/resources/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const resource = await this.resourcesService.findById(id);
    if (!resource) {
      throw new NotFoundException(`Resource not found`);
    }

    return resource;
  }
}
