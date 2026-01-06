import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmConfigFactory } from '../config';
import { AuthModule } from '../modules/auth';
import { UsersModule } from '../modules/users';
import { AuditSubscriber, ImmutableSubscriber } from '../subscribers';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfigFactory,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuditSubscriber, ImmutableSubscriber],
})
export class AppModule {}
