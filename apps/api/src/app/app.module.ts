import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmConfigFactory } from '../config';
import { AdminModule } from '../modules/admin';
import { AuthModule } from '../modules/auth';
import { UsersModule } from '../modules/users';
import { GoalsModule } from '../modules/goals';
import { GroupsModule } from '../modules/groups';
import { PropertiesModule } from '../modules/properties';
import { PropertyResidentsModule } from '../modules/property-residents';
import { AuditSubscriber, ImmutableSubscriber } from '../subscribers';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfigFactory,
    }),
    AdminModule,
    UsersModule,
    AuthModule,
    GoalsModule,
    GroupsModule,
    PropertiesModule,
    PropertyResidentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuditSubscriber, ImmutableSubscriber],
})
export class AppModule {}
