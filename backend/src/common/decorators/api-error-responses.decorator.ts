import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  ForbiddenResponseDto,
  NotFoundResponseDto,
  ConflictResponseDto,
  UnprocessableResponseDto,
  TooManyRequestsResponseDto,
  InternalServerErrorResponseDto,
} from '../dto/error-response.dto';

/**
 * Applies standard API error response decorators to a controller or method.
 * Covers: 400, 401, 403, 404, 409, 422, 429, 500
 */
export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request — validation failed or malformed input',
      type: BadRequestResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized — missing or invalid authentication token',
      type: UnauthorizedResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden — insufficient permissions for this resource',
      type: ForbiddenResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found — requested resource does not exist',
      type: NotFoundResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict — resource already exists or state conflict',
      type: ConflictResponseDto,
    }),
    ApiResponse({
      status: 422,
      description: 'Unprocessable Entity — semantically invalid request',
      type: UnprocessableResponseDto,
    }),
    ApiResponse({
      status: 429,
      description: 'Too Many Requests — rate limit exceeded',
      type: TooManyRequestsResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error — unexpected server failure',
      type: InternalServerErrorResponseDto,
    })
  );
}
