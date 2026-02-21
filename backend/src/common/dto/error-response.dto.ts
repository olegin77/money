import { ApiProperty } from '@nestjs/swagger';

/**
 * Shared error response schema for Swagger documentation.
 * All API error responses follow this structure.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Descriptive error message' })
  message: string;

  @ApiProperty({ example: 'BAD_REQUEST', description: 'Machine-readable error code' })
  error: string;

  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;
}

export class BadRequestResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 400 })
  declare statusCode: number;

  @ApiProperty({ example: 'BAD_REQUEST' })
  declare error: string;

  @ApiProperty({ example: 'Validation failed', description: 'Description of the validation error' })
  declare message: string;
}

export class UnauthorizedResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 401 })
  declare statusCode: number;

  @ApiProperty({ example: 'UNAUTHORIZED' })
  declare error: string;

  @ApiProperty({ example: 'Invalid or expired token' })
  declare message: string;
}

export class ForbiddenResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 403 })
  declare statusCode: number;

  @ApiProperty({ example: 'FORBIDDEN' })
  declare error: string;

  @ApiProperty({ example: 'Insufficient permissions' })
  declare message: string;
}

export class NotFoundResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 404 })
  declare statusCode: number;

  @ApiProperty({ example: 'NOT_FOUND' })
  declare error: string;

  @ApiProperty({ example: 'Resource not found' })
  declare message: string;
}

export class ConflictResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 409 })
  declare statusCode: number;

  @ApiProperty({ example: 'CONFLICT' })
  declare error: string;

  @ApiProperty({ example: 'Resource already exists' })
  declare message: string;
}

export class UnprocessableResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 422 })
  declare statusCode: number;

  @ApiProperty({ example: 'UNPROCESSABLE_ENTITY' })
  declare error: string;

  @ApiProperty({ example: 'Unable to process the request' })
  declare message: string;
}

export class TooManyRequestsResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 429 })
  declare statusCode: number;

  @ApiProperty({ example: 'TOO_MANY_REQUESTS' })
  declare error: string;

  @ApiProperty({ example: 'Rate limit exceeded. Try again later.' })
  declare message: string;
}

export class InternalServerErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({ example: 500 })
  declare statusCode: number;

  @ApiProperty({ example: 'INTERNAL_SERVER_ERROR' })
  declare error: string;

  @ApiProperty({ example: 'An unexpected error occurred' })
  declare message: string;
}
