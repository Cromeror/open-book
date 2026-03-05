import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResourceHttpMethod } from '../../entities/resource-http-method.entity';
import { ModuleResource } from '../../entities/module-resource.entity';
import { SessionContextModule } from '../session-context/session-context.module';

import { HateoasService } from './hateoas.service';
import { HateoasInterceptor } from './hateoas.interceptor';

/**
 * Global HATEOAS module.
 *
 * Registers HateoasInterceptor as a global APP_INTERCEPTOR so it runs on
 * every handler that has the @HateoasResource decorator, without needing
 * to add it to each module individually.
 *
 * Requires AppCacheModule to be loaded globally (already done in app.module.ts).
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceHttpMethod, ModuleResource]),
    SessionContextModule,
  ],
  providers: [
    HateoasService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HateoasInterceptor,
    },
  ],
  exports: [HateoasService],
})
export class HateoasModule {}
