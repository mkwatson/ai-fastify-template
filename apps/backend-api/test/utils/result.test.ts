/**
 * Comprehensive tests for Result utilities and error handling patterns
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import {
  ok,
  err,
  ResultUtils,
  FastifyResultUtils,
  AsyncResultUtils,
  CommonResults,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalError,
  ServiceUnavailableError,
  isOperationalError,
  isAppError,
} from '../../src/utils/result.js';

describe('Result Utilities', () => {
  describe('Core Result Types', () => {
    it('should create successful results', () => {
      const result = ok('success');
      
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.value).toBe('success');
    });

    it('should create error results', () => {
      const error = new Error('test error');
      const result = err(error);
      
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe('AppError Base Class', () => {
    class TestError extends AppError {
      readonly code = 'TEST_ERROR';
      readonly statusCode = 400;
      readonly isOperational = true;
    }

    it('should create AppError with context', () => {
      const error = new TestError('Test message', { userId: '123' });
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.context).toEqual({ userId: '123' });
    });

    it('should convert to safe object for logging', () => {
      const error = new TestError('Test message', { userId: '123', password: 'secret' });
      const safeObject = error.toSafeObject();
      
      expect(safeObject).toEqual({
        name: 'TestError',
        message: 'Test message',
        code: 'TEST_ERROR',
        statusCode: 400,
        context: { userId: '123', password: 'secret' },
      });
    });

    it('should maintain proper prototype chain', () => {
      const error = new TestError('Test message');
      
      expect(error instanceof TestError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Specific Error Types', () => {
    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid email', 'email');
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.field).toBe('email');
    });

    it('should create ValidationError from ZodError', () => {
      const schema = z.object({ email: z.string().email() });
      const zodResult = schema.safeParse({ email: 'invalid' });
      
      if (!zodResult.success) {
        const error = ValidationError.fromZodError(zodResult.error);
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.field).toBe('email');
        expect(error.details).toBe(zodResult.error);
      }
    });

    it('should create NotFoundError', () => {
      const error = new NotFoundError('User', '123');
      
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("User with id '123' not found");
      expect(error.context).toEqual({ resource: 'User', id: '123' });
    });

    it('should create UnauthorizedError', () => {
      const error = new UnauthorizedError();
      
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should create ForbiddenError', () => {
      const error = new ForbiddenError();
      
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should create ConflictError', () => {
      const error = new ConflictError('User');
      
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('User already exists');
    });

    it('should create InternalError', () => {
      const error = new InternalError();
      
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    it('should create ServiceUnavailableError', () => {
      const error = new ServiceUnavailableError('Database');
      
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('Database is currently unavailable');
    });
  });

  describe('Type Guards', () => {
    it('should identify operational errors', () => {
      const operationalError = new ValidationError('Test');
      const nonOperationalError = new InternalError('Test');
      const regularError = new Error('Test');
      
      expect(isOperationalError(operationalError)).toBe(true);
      expect(isOperationalError(nonOperationalError)).toBe(false);
      expect(isOperationalError(regularError)).toBe(false);
    });

    it('should identify app errors', () => {
      const appError = new ValidationError('Test');
      const regularError = new Error('Test');
      
      expect(isAppError(appError)).toBe(true);
      expect(isAppError(regularError)).toBe(false);
    });
  });

  describe('ResultUtils', () => {
    describe('parseZod', () => {
      it('should parse valid data', () => {
        const schema = z.object({ name: z.string() });
        const result = ResultUtils.parseZod(schema, { name: 'John' });
        
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual({ name: 'John' });
        }
      });

      it('should return validation error for invalid data', () => {
        const schema = z.object({ email: z.string().email() });
        const result = ResultUtils.parseZod(schema, { email: 'invalid' });
        
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe('fromPromise', () => {
      it('should handle successful promise', async () => {
        const promise = Promise.resolve('success');
        const result = await ResultUtils.fromPromise(promise);
        
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('success');
        }
      });

      it('should handle rejected promise', async () => {
        const promise = Promise.reject(new Error('failed'));
        const result = await ResultUtils.fromPromise(promise);
        
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toBe('failed');
        }
      });

      it('should use custom error handler', async () => {
        const promise = Promise.reject(new Error('original'));
        const result = await ResultUtils.fromPromise(
          promise,
          () => new ValidationError('custom error')
        );
        
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toBe('custom error');
        }
      });
    });

    describe('fromThrowable', () => {
      it('should handle successful function', () => {
        const fn = () => 'success';
        const result = ResultUtils.fromThrowable(fn);
        
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('success');
        }
      });

      it('should handle throwing function', () => {
        const fn = () => {
          throw new Error('failed');
        };
        const result = ResultUtils.fromThrowable(fn);
        
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toBe('failed');
        }
      });
    });

    describe('combine', () => {
      it('should combine successful results', () => {
        const results = [ok(1), ok(2), ok(3)] as const;
        const combined = ResultUtils.combine(results);
        
        expect(combined.isOk()).toBe(true);
        if (combined.isOk()) {
          expect(combined.value).toEqual([1, 2, 3]);
        }
      });

      it('should return first error on failure', () => {
        const error1 = new ValidationError('Error 1');
        const error2 = new ValidationError('Error 2');
        const results = [ok(1), err(error1), err(error2)] as const;
        const combined = ResultUtils.combine(results);
        
        expect(combined.isErr()).toBe(true);
        if (combined.isErr()) {
          expect(combined.error).toBe(error1);
        }
      });
    });

    describe('chain', () => {
      it('should chain successful operations', () => {
        const result = ok(5);
        const doubled = ResultUtils.chain(result, (value) => ok(value * 2));
        
        expect(doubled.isOk()).toBe(true);
        if (doubled.isOk()) {
          expect(doubled.value).toBe(10);
        }
      });

      it('should propagate errors', () => {
        const error = new ValidationError('Test error');
        const result = err(error);
        const chained = ResultUtils.chain(result, (value) => ok(value * 2));
        
        expect(chained.isErr()).toBe(true);
        if (chained.isErr()) {
          expect(chained.error).toBe(error);
        }
      });

      it('should handle errors in chain function', () => {
        const result = ok(5);
        const error = new ValidationError('Chain error');
        const chained = ResultUtils.chain(result, () => err(error));
        
        expect(chained.isErr()).toBe(true);
        if (chained.isErr()) {
          expect(chained.error).toBe(error);
        }
      });
    });

    describe('withDefault', () => {
      it('should return value for successful result', () => {
        const result = ok('success');
        const value = ResultUtils.withDefault(result, 'default');
        
        expect(value).toBe('success');
      });

      it('should return default for error result', () => {
        const result = err(new Error('failed'));
        const value = ResultUtils.withDefault(result, 'default');
        
        expect(value).toBe('default');
      });
    });

    describe('toOption', () => {
      it('should return value for successful result', () => {
        const result = ok('success');
        const option = ResultUtils.toOption(result);
        
        expect(option).toBe('success');
      });

      it('should return null for error result', () => {
        const result = err(new Error('failed'));
        const option = ResultUtils.toOption(result);
        
        expect(option).toBeNull();
      });
    });

    describe('collectSuccesses', () => {
      it('should collect only successful results', () => {
        const results = [
          ok(1),
          err(new Error('error1')),
          ok(3),
          err(new Error('error2')),
          ok(5),
        ];
        
        const successes = ResultUtils.collectSuccesses(results);
        expect(successes).toEqual([1, 3, 5]);
      });
    });

    describe('collectErrors', () => {
      it('should collect only error results', () => {
        const error1 = new Error('error1');
        const error2 = new Error('error2');
        const results = [
          ok(1),
          err(error1),
          ok(3),
          err(error2),
          ok(5),
        ];
        
        const errors = ResultUtils.collectErrors(results);
        expect(errors).toEqual([error1, error2]);
      });
    });
  });

  describe('FastifyResultUtils', () => {
    const mockFastify = {
      log: {
        error: vi.fn(),
      },
      httpErrors: {
        badRequest: vi.fn((msg) => new Error(`400: ${msg}`)),
        unauthorized: vi.fn((msg) => new Error(`401: ${msg}`)),
        forbidden: vi.fn((msg) => new Error(`403: ${msg}`)),
        notFound: vi.fn((msg) => new Error(`404: ${msg}`)),
        conflict: vi.fn((msg) => new Error(`409: ${msg}`)),
        internalServerError: vi.fn((msg) => new Error(`500: ${msg}`)),
        serviceUnavailable: vi.fn((msg) => new Error(`503: ${msg}`)),
      },
    } as any;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('toHttpError', () => {
      it('should convert ValidationError to badRequest', () => {
        const error = new ValidationError('Invalid input');
        FastifyResultUtils.toHttpError(mockFastify, error);
        
        expect(mockFastify.httpErrors.badRequest).toHaveBeenCalledWith('Invalid input');
      });

      it('should convert NotFoundError to notFound', () => {
        const error = new NotFoundError('User', '123');
        FastifyResultUtils.toHttpError(mockFastify, error);
        
        expect(mockFastify.httpErrors.notFound).toHaveBeenCalledWith("User with id '123' not found");
      });

      it('should convert ConflictError to conflict', () => {
        const error = new ConflictError('User');
        FastifyResultUtils.toHttpError(mockFastify, error);
        
        expect(mockFastify.httpErrors.conflict).toHaveBeenCalledWith('User already exists');
      });

      it('should convert InternalError to internalServerError', () => {
        const error = new InternalError('Database failed');
        FastifyResultUtils.toHttpError(mockFastify, error);
        
        expect(mockFastify.httpErrors.internalServerError).toHaveBeenCalledWith('Database failed');
      });
    });

    describe('handleResult', () => {
      it('should return value for successful result', () => {
        const result = ok('success');
        const value = FastifyResultUtils.handleResult(mockFastify, result);
        
        expect(value).toBe('success');
      });

      it('should throw HTTP error for error result', () => {
        const error = new ValidationError('Invalid input');
        const result = err(error);
        
        expect(() => FastifyResultUtils.handleResult(mockFastify, result))
          .toThrow('400: Invalid input');
        
        expect(mockFastify.log.error).toHaveBeenCalledWith(
          {
            error: error.toSafeObject(),
            stack: error.stack,
          },
          'Application error occurred'
        );
      });
    });

    describe('wrapHandler', () => {
      it('should wrap service function for automatic error handling', async () => {
        const serviceFunction = vi.fn().mockResolvedValue(ok('success'));
        const wrappedHandler = FastifyResultUtils.wrapHandler(mockFastify, serviceFunction);
        
        const result = await wrappedHandler('input');
        
        expect(result).toBe('success');
        expect(serviceFunction).toHaveBeenCalledWith('input');
      });

      it('should handle service errors automatically', async () => {
        const error = new ValidationError('Invalid input');
        const serviceFunction = vi.fn().mockResolvedValue(err(error));
        const wrappedHandler = FastifyResultUtils.wrapHandler(mockFastify, serviceFunction);
        
        await expect(wrappedHandler('input')).rejects.toThrow('400: Invalid input');
      });
    });
  });

  describe('AsyncResultUtils', () => {
    describe('map', () => {
      it('should map successful async result', async () => {
        const asyncResult = Promise.resolve(ok(5));
        const mapped = await AsyncResultUtils.map(asyncResult, (value) => value * 2);
        
        expect(mapped.isOk()).toBe(true);
        if (mapped.isOk()) {
          expect(mapped.value).toBe(10);
        }
      });

      it('should propagate errors', async () => {
        const error = new ValidationError('Test error');
        const asyncResult = Promise.resolve(err(error));
        const mapped = await AsyncResultUtils.map(asyncResult, (value) => value * 2);
        
        expect(mapped.isErr()).toBe(true);
        if (mapped.isErr()) {
          expect(mapped.error).toBe(error);
        }
      });

      it('should handle async mapping functions', async () => {
        const asyncResult = Promise.resolve(ok(5));
        const mapped = await AsyncResultUtils.map(asyncResult, async (value) => {
          await new Promise(resolve => globalThis.setTimeout(resolve, 1));
          return value * 2;
        });
        
        expect(mapped.isOk()).toBe(true);
        if (mapped.isOk()) {
          expect(mapped.value).toBe(10);
        }
      });
    });

    describe('chain', () => {
      it('should chain async operations', async () => {
        const asyncResult = Promise.resolve(ok(5));
        const chained = await AsyncResultUtils.chain(
          asyncResult,
          async (value) => ok(value * 2)
        );
        
        expect(chained.isOk()).toBe(true);
        if (chained.isOk()) {
          expect(chained.value).toBe(10);
        }
      });

      it('should propagate first error', async () => {
        const error = new ValidationError('First error');
        const asyncResult = Promise.resolve(err(error));
        const chained = await AsyncResultUtils.chain(
          asyncResult,
          async (value) => ok(value * 2)
        );
        
        expect(chained.isErr()).toBe(true);
        if (chained.isErr()) {
          expect(chained.error).toBe(error);
        }
      });

      it('should propagate second error', async () => {
        const error = new ValidationError('Second error');
        const asyncResult = Promise.resolve(ok(5));
        const chained = await AsyncResultUtils.chain(
          asyncResult,
          async () => err(error)
        );
        
        expect(chained.isErr()).toBe(true);
        if (chained.isErr()) {
          expect(chained.error).toBe(error);
        }
      });
    });

    describe('all', () => {
      it('should resolve all successful async results', async () => {
        const asyncResults = [
          Promise.resolve(ok(1)),
          Promise.resolve(ok(2)),
          Promise.resolve(ok(3)),
        ];
        
        const result = await AsyncResultUtils.all(asyncResults);
        
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual([1, 2, 3]);
        }
      });

      it('should return first error', async () => {
        const error1 = new ValidationError('Error 1');
        const error2 = new ValidationError('Error 2');
        const asyncResults = [
          Promise.resolve(ok(1)),
          Promise.resolve(err(error1)),
          Promise.resolve(err(error2)),
        ];
        
        const result = await AsyncResultUtils.all(asyncResults);
        
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBe(error1);
        }
      });
    });
  });

  describe('CommonResults', () => {
    it('should create not found result', () => {
      const result = CommonResults.notFound('User', '123');
      
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(NotFoundError);
        expect(result.error.message).toBe("User with id '123' not found");
      }
    });

    it('should create validation error result', () => {
      const result = CommonResults.validationError('Invalid email', 'email');
      
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.message).toBe('Invalid email');
        expect(result.error.field).toBe('email');
      }
    });

    it('should create unauthorized result', () => {
      const result = CommonResults.unauthorized('Invalid token');
      
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(UnauthorizedError);
        expect(result.error.message).toBe('Invalid token');
      }
    });

    it('should create forbidden result', () => {
      const result = CommonResults.forbidden('Access denied');
      
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ForbiddenError);
        expect(result.error.message).toBe('Access denied');
      }
    });

    it('should create conflict result', () => {
      const result = CommonResults.conflict('User', 'Email already exists');
      
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ConflictError);
        expect(result.error.message).toBe('Email already exists');
      }
    });

    it('should create internal error result', () => {
      const result = CommonResults.internalError('Database connection failed');
      
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe('Database connection failed');
      }
    });
  });
});