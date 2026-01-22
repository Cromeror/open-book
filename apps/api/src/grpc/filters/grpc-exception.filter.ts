import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';

/**
 * gRPC Exception Filter
 *
 * Converts NestJS HTTP exceptions to gRPC status codes.
 * This ensures that business logic exceptions (NotFoundException,
 * UnauthorizedException, etc.) are properly translated to gRPC errors.
 *
 * Mapping:
 * - NotFoundException (404) → NOT_FOUND
 * - UnauthorizedException (401) → UNAUTHENTICATED
 * - ForbiddenException (403) → PERMISSION_DENIED
 * - BadRequestException (400) → INVALID_ARGUMENT
 * - ConflictException (409) → ALREADY_EXISTS
 * - UnprocessableEntityException (422) → FAILED_PRECONDITION
 * - InternalServerErrorException (500) → INTERNAL
 * - Default → UNKNOWN
 */
@Catch()
export class GrpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    // If it's already an RpcException, use default handling
    if (exception instanceof RpcException) {
      return super.catch(exception, host) as Observable<any>;
    }

    // Convert HttpException to gRPC status code
    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const grpcStatusCode = this.httpToGrpcStatus(httpStatus);
      const message = exception.message;

      // Create gRPC error with proper status code
      const grpcError = {
        code: grpcStatusCode,
        message: message,
        details: this.getExceptionDetails(exception),
      };

      return throwError(() => grpcError);
    }

    // Handle unexpected errors
    const grpcError = {
      code: GrpcStatus.INTERNAL,
      message: 'Internal server error',
      details: exception instanceof Error ? [exception.message] : [],
    };

    return throwError(() => grpcError);
  }

  /**
   * Map HTTP status codes to gRPC status codes
   */
  private httpToGrpcStatus(httpStatus: number): GrpcStatus {
    switch (httpStatus) {
      case HttpStatus.BAD_REQUEST:
        return GrpcStatus.INVALID_ARGUMENT;
      case HttpStatus.UNAUTHORIZED:
        return GrpcStatus.UNAUTHENTICATED;
      case HttpStatus.FORBIDDEN:
        return GrpcStatus.PERMISSION_DENIED;
      case HttpStatus.NOT_FOUND:
        return GrpcStatus.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return GrpcStatus.ALREADY_EXISTS;
      case HttpStatus.GONE:
        return GrpcStatus.DATA_LOSS;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return GrpcStatus.FAILED_PRECONDITION;
      case HttpStatus.TOO_MANY_REQUESTS:
        return GrpcStatus.RESOURCE_EXHAUSTED;
      case HttpStatus.NOT_IMPLEMENTED:
        return GrpcStatus.UNIMPLEMENTED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return GrpcStatus.UNAVAILABLE;
      case HttpStatus.GATEWAY_TIMEOUT:
        return GrpcStatus.DEADLINE_EXCEEDED;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return GrpcStatus.INTERNAL;
      default:
        return GrpcStatus.UNKNOWN;
    }
  }

  /**
   * Extract detailed error information from exception
   */
  private getExceptionDetails(exception: HttpException): string[] {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return [response];
    }

    if (typeof response === 'object' && response !== null) {
      const details: string[] = [];

      // Extract validation errors if present
      if ('message' in response) {
        const message = (response as { message?: unknown }).message;
        if (Array.isArray(message)) {
          details.push(...message.map(String));
        } else if (typeof message === 'string') {
          details.push(message);
        }
      }

      // Extract error details if present
      if ('error' in response) {
        const error = (response as { error?: unknown }).error;
        if (typeof error === 'string') {
          details.push(error);
        }
      }

      return details;
    }

    return [];
  }
}
