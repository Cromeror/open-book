import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmConfigFactory } from '../config';
import { AdminModule } from '../modules/admin';
import { AuthModule } from '../modules/auth';
import { UsersModule } from '../modules/users';
import { ResourcesModule } from '../modules/resources/resources.module';
import { ExternalProxyModule } from '../modules/external-proxy';
import { GrpcModule } from '../grpc/grpc.module';
import { AppCacheModule } from '../modules/cache/cache.module';
import { HateoasModule } from '../modules/hateoas/hateoas.module';
import { AuditSubscriber, ImmutableSubscriber } from '../subscribers';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfigFactory,
    }),
    AppCacheModule,
    HateoasModule,
    AdminModule,
    UsersModule,
    AuthModule,
    ResourcesModule,
    ExternalProxyModule,
    GrpcModule,
    RouterModule.register([
      { path: 'ext', module: ExternalProxyModule },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, AuditSubscriber, ImmutableSubscriber],
})
export class AppModule {}
