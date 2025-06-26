/**
 * Result/Option types and utilities for explicit error handling
 *
 * This module provides enterprise-grade error handling patterns using neverthrow
 * to replace throw/catch patterns with explicit Result<T, E> types.
 *
 * @module result
 */

import type { FastifyInstance } from 'fastify';
import { Result, Ok, Err, ok, err } from 'neverthrow';
import { z } from 'zod';

// Re-export neverthrow core types and functions
export { Result, Ok, Err, ok, err } from 'neverthrow';

/**
 * Standard error types for the application
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to safe object for logging (removes sensitive data)
   */
  toSafeObject(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

/**
 * Validation errors (400 Bad Request)
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly field?: string,
    public readonly details?: z.ZodError,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }

  static fromZodError(
    error: z.ZodError,
    context?: Record<string, unknown>
  ): ValidationError {
    const firstIssue = error.issues[0];
    const field = firstIssue?.path.join('.') ?? 'unknown';
    const message = firstIssue?.message ?? 'Validation failed';

    return new ValidationError(message, field, error, context);
  }
}

/**
 * Not found errors (404 Not Found)
 */
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(
    resource: string,
    id?: string,
    context?: Record<string, unknown>
  ) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, { resource, id, ...context });
  }
}

/**
 * Unauthorized errors (401 Unauthorized)
 */
export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message = 'Unauthorized', context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Forbidden errors (403 Forbidden)
 */
export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message = 'Forbidden', context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Conflict errors (409 Conflict)
 */
export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(
    resource: string,
    message?: string,
    context?: Record<string, unknown>
  ) {
    super(message ?? `${resource} already exists`, { resource, ...context });
  }
}

/**
 * Internal server errors (500 Internal Server Error)
 */
export class InternalError extends AppError {
  readonly code = 'INTERNAL_ERROR';
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(
    message = 'Internal server error',
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Service unavailable errors (503 Service Unavailable)
 */
export class ServiceUnavailableError extends AppError {
  readonly code = 'SERVICE_UNAVAILABLE';
  readonly statusCode = 503;
  readonly isOperational = true;

  constructor(service: string, context?: Record<string, unknown>) {
    super(`${service} is currently unavailable`, { service, ...context });
  }
}

/**
 * Union type of all application errors
 */
export type ApplicationError =
  | ValidationError
  | NotFoundError
  | UnauthorizedError
  | ForbiddenError
  | ConflictError
  | InternalError
  | ServiceUnavailableError;

/**
 * Type guard to check if an error is an operational error
 */
export function isOperationalError(error: unknown): error is AppError {
  return error instanceof AppError && error.isOperational;
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Utility functions for working with Results
 */
export const ResultUtils = {
  /**
   * Safely parse with Zod, returning Result instead of throwing
   */
  parseZod: <T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): Result<T, ValidationError> => {
    const result = schema.safeParse(data);
    if (result.success) {
      return ok(result.data);
    }
    return err(ValidationError.fromZodError(result.error));
  },

  /**
   * Convert a Promise that might throw to a Result Promise
   */
  fromPromise: async <T, E = Error>(
    promise: Promise<T>,
    errorHandler?: (error: unknown) => E
  ): Promise<Result<T, E>> => {
    try {
      const result = await promise;
      return ok(result);
    } catch (error) {
      if (errorHandler) {
        return err(errorHandler(error));
      }
      return err(error as E);
    }
  },

  /**
   * Convert a function that might throw to a Result
   */
  fromThrowable: <T, E = Error>(
    fn: () => T,
    errorHandler?: (error: unknown) => E
  ): Result<T, E> => {
    try {
      const result = fn();
      return ok(result);
    } catch (error) {
      if (errorHandler) {
        return err(errorHandler(error));
      }
      return err(error as E);
    }
  },

  /**
   * Combine multiple Results into a single Result
   * All must succeed for the combined result to succeed
   */
  combine: <T extends readonly Result<unknown, unknown>[]>(
    results: T
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
    T[number] extends Result<unknown, infer E> ? E : never
  > => {
    const values: unknown[] = [];
    for (const result of results) {
      if (result.isErr()) {
        return err(
          result.error as T[number] extends Result<unknown, infer E> ? E : never
        );
      }
      values.push(result.value);
    }
    return ok(values) as Result<
      { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
      T[number] extends Result<unknown, infer E> ? E : never
    >;
  },

  /**
   * Map over a Result with a function that returns a Result
   * (flatMap/chain operation)
   */
  chain: <T, U, E, F>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, F>
  ): Result<U, E | F> => {
    if (result.isErr()) {
      return err(result.error);
    }
    return fn(result.value);
  },

  /**
   * Apply a fallback value if Result is an error
   */
  withDefault: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    return result.isOk() ? result.value : defaultValue;
  },

  /**
   * Convert Result to Option (None if error, Some if success)
   */
  toOption: <T>(result: Result<T, unknown>): T | null => {
    return result.isOk() ? result.value : null;
  },

  /**
   * Collect all successful results, ignore errors
   */
  collectSuccesses: <T, E>(results: Result<T, E>[]): T[] => {
    return results
      .filter((result): result is Ok<T, E> => result.isOk())
      .map(result => result.value);
  },

  /**
   * Collect all error results, ignore successes
   */
  collectErrors: <T, E>(results: Result<T, E>[]): E[] => {
    return results
      .filter((result): result is Err<T, E> => result.isErr())
      .map(result => result.error);
  },
};

/**
 * Fastify integration utilities
 */
export const FastifyResultUtils = {
  /**
   * Convert AppError to Fastify HTTP error
   */
  toHttpError: (fastify: FastifyInstance, error: AppError): Error => {
    switch (error.statusCode) {
      case 400:
        return fastify.httpErrors.badRequest(error.message);
      case 401:
        return fastify.httpErrors.unauthorized(error.message);
      case 403:
        return fastify.httpErrors.forbidden(error.message);
      case 404:
        return fastify.httpErrors.notFound(error.message);
      case 409:
        return fastify.httpErrors.conflict(error.message);
      case 503:
        return fastify.httpErrors.serviceUnavailable(error.message);
      default:
        return fastify.httpErrors.internalServerError(error.message);
    }
  },

  /**
   * Handle Result in Fastify route - automatically convert errors to HTTP responses
   */
  handleResult: <T>(
    fastify: FastifyInstance,
    result: Result<T, ApplicationError>
  ): T => {
    if (result.isOk()) {
      return result.value;
    }

    // Log error for monitoring
    fastify.log.error(
      {
        error: result.error.toSafeObject(),
        stack: result.error.stack,
      },
      'Application error occurred'
    );

    // Convert to HTTP error and throw
    throw FastifyResultUtils.toHttpError(fastify, result.error);
  },

  /**
   * Wrap a service function to automatically handle Results in routes
   */
  wrapHandler: <TArgs extends unknown[], TReturn>(
    fastify: FastifyInstance,
    fn: (...args: TArgs) => Promise<Result<TReturn, ApplicationError>>
  ): ((...args: TArgs) => Promise<TReturn>) => {
    return async (...args: TArgs): Promise<TReturn> => {
      const result = await fn(...args);
      return FastifyResultUtils.handleResult(fastify, result);
    };
  },
};

/**
 * Common Result patterns for typical operations
 */
export const CommonResults = {
  /**
   * Create a not found error result
   */
  notFound: (resource: string, id?: string): Result<never, NotFoundError> => {
    return err(new NotFoundError(resource, id));
  },

  /**
   * Create a validation error result
   */
  validationError: (
    message: string,
    field?: string
  ): Result<never, ValidationError> => {
    return err(new ValidationError(message, field));
  },

  /**
   * Create an unauthorized error result
   */
  unauthorized: (message?: string): Result<never, UnauthorizedError> => {
    return err(new UnauthorizedError(message));
  },

  /**
   * Create a forbidden error result
   */
  forbidden: (message?: string): Result<never, ForbiddenError> => {
    return err(new ForbiddenError(message));
  },

  /**
   * Create a conflict error result
   */
  conflict: (
    resource: string,
    message?: string
  ): Result<never, ConflictError> => {
    return err(new ConflictError(resource, message));
  },

  /**
   * Create an internal error result
   */
  internalError: (message?: string): Result<never, InternalError> => {
    return err(new InternalError(message));
  },
};

/**
 * Async Result utilities for Promise-based operations
 */
export const AsyncResultUtils = {
  /**
   * Map over async Result
   */
  map: async <T, U, E>(
    result: Promise<Result<T, E>>,
    fn: (value: T) => U | Promise<U>
  ): Promise<Result<U, E>> => {
    const resolvedResult = await result;
    if (resolvedResult.isErr()) {
      return err(resolvedResult.error);
    }
    const mappedValue = await fn(resolvedResult.value);
    return ok(mappedValue);
  },

  /**
   * Chain async Results
   */
  chain: async <T, U, E, F>(
    result: Promise<Result<T, E>>,
    fn: (value: T) => Promise<Result<U, F>>
  ): Promise<Result<U, E | F>> => {
    const resolvedResult = await result;
    if (resolvedResult.isErr()) {
      return err(resolvedResult.error);
    }
    return fn(resolvedResult.value);
  },

  /**
   * Parallel execution of async Results
   */
  all: async <T extends readonly Promise<Result<unknown, unknown>>[]>(
    results: T
  ): Promise<
    Result<
      {
        [K in keyof T]: T[K] extends Promise<Result<infer U, unknown>>
          ? U
          : never;
      },
      T[number] extends Promise<Result<unknown, infer E>> ? E : never
    >
  > => {
    const resolvedResults = await Promise.all(results);
    return ResultUtils.combine(resolvedResults) as Result<
      {
        [K in keyof T]: T[K] extends Promise<Result<infer U, unknown>>
          ? U
          : never;
      },
      T[number] extends Promise<Result<unknown, infer E>> ? E : never
    >;
  },
};

/**
 * Type aliases for common Result patterns
 */
export type AsyncResult<T, E = ApplicationError> = Promise<Result<T, E>>;
export type ServiceResult<T> = Result<T, ApplicationError>;
export type AsyncServiceResult<T> = AsyncResult<T, ApplicationError>;

/**
 * Helper to create strongly-typed service methods
 */
export const createService = <
  T extends Record<string, (...args: unknown[]) => AsyncServiceResult<unknown>>,
>(
  methods: T
): T => methods;
