/**
 * OpenBook API Server
 * Hybrid application running both HTTP and gRPC servers
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app/app.module';
import { grpcConfig } from './config/grpc.config';
import { createGrpcOptions } from './grpc/grpc-server.options';

async function bootstrap() {
  // ========================================
  // HTTP Server (existing)
  // ========================================
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3001;

  // ========================================
  // gRPC Server
  // ========================================
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    createGrpcOptions()
  );

  await grpcApp.listen();
  Logger.log(
    `🔐 gRPC server is running on: ${grpcConfig.GRPC_HOST}:${grpcConfig.GRPC_PORT}`
  );
  Logger.log('   ✓ mTLS enabled (client certificate required)');
  Logger.log('   ✓ JWT authentication enabled');

  // ========================================
  // Start HTTP Server
  // ========================================
  await app.listen(port);
  Logger.log(
    `🚀 HTTP server is running on: http://localhost:${port}/${globalPrefix}`
  );
}

void bootstrap();
