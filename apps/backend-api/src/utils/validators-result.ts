/**
 * Result-based validators demonstrating migration from throw/catch to explicit error handling
 *
 * This module shows how to refactor existing validators to use Result types
 * for explicit error handling instead of try/catch patterns.
 *
 * @module validators-result
 */

import { z } from 'zod';

import {
  Result,
  ok,
  err,
  ResultUtils,
  ValidationError,
  type ServiceResult,
  type ApplicationError,
} from './result.js';
// Import original schemas for consistency
import {
  EmailSchema,
  UrlSchema,
  PhoneSchema,
  PasswordSchema,
} from './validators.js';

/**
 * Result-based email validation
 *
 * @example
 * ```typescript
 * const result = validateEmail('user@example.com');
 * if (result.isOk()) {
 *   console.log('Valid email:', result.value);
 * } else {
 *   console.error('Validation error:', result.error.message);
 * }
 * ```
 */
export function validateEmail(email: string): ServiceResult<string> {
  return ResultUtils.parseZod(EmailSchema, email);
}

/**
 * Result-based URL validation
 */
export function validateUrl(url: string): ServiceResult<string> {
  return ResultUtils.parseZod(UrlSchema, url);
}

/**
 * Result-based phone number validation
 */
export function validatePhoneNumber(phone: string): ServiceResult<string> {
  return ResultUtils.parseZod(PhoneSchema, phone);
}

/**
 * Result-based password strength validation
 */
export function validatePassword(password: string): ServiceResult<string> {
  return ResultUtils.parseZod(PasswordSchema, password);
}

/**
 * Enhanced password validation with detailed error context
 */
export function validatePasswordWithDetails(
  password: string
): Result<string, ValidationError> {
  const result = PasswordSchema.safeParse(password);

  if (result.success) {
    return ok(result.data);
  }

  // Create detailed validation error with all issues
  const error = new ValidationError(
    'Password validation failed',
    'password',
    result.error,
    {
      requirements: [
        'At least 8 characters',
        'One uppercase letter',
        'One lowercase letter',
        'One number',
        'One special character',
      ],
      failedCount: result.error.issues.length,
    }
  );

  return err(error);
}

/**
 * User registration data validation schema
 */
export const UserRegistrationSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: PhoneSchema.optional(),
});

export type UserRegistrationData = z.infer<typeof UserRegistrationSchema>;

/**
 * Validate complete user registration data
 */
export function validateUserRegistration(
  data: unknown
): ServiceResult<UserRegistrationData> {
  return ResultUtils.parseZod(UserRegistrationSchema, data);
}

/**
 * User profile update schema (all fields optional except validation rules)
 */
export const UserProfileUpdateSchema = z.object({
  email: EmailSchema.optional(),
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name too long')
    .optional(),
  phone: PhoneSchema.optional(),
});

export type UserProfileUpdateData = z.infer<typeof UserProfileUpdateSchema>;

/**
 * Validate user profile update data
 */
export function validateUserProfileUpdate(
  data: unknown
): ServiceResult<UserProfileUpdateData> {
  return ResultUtils.parseZod(UserProfileUpdateSchema, data);
}

/**
 * Validation utilities for common operations
 */
export const ValidationUtils = {
  /**
   * Validate multiple fields and collect all errors
   */
  validateFields: <T extends Record<string, unknown>>(
    fields: { [K in keyof T]: (value: T[K]) => ServiceResult<T[K]> },
    data: T
  ): Result<T, ValidationError[]> => {
    const results: Array<Result<unknown, ValidationError>> = [];
    const validatedData: Partial<T> = {};

    for (const [key, validator] of Object.entries(fields)) {
      const result = validator(data[key as keyof T]);
      results.push(result);

      if (result.isOk()) {
        validatedData[key as keyof T] = result.value as T[keyof T];
      }
    }

    const errors = ResultUtils.collectErrors(results);
    if (errors.length > 0) {
      return err(errors);
    }

    return ok(validatedData as T);
  },

  /**
   * Validate array of items
   */
  validateArray: <T>(
    validator: (item: unknown) => ServiceResult<T>,
    items: unknown[]
  ): Result<T[], ValidationError[]> => {
    const results = items.map(validator);
    const errors = ResultUtils.collectErrors(results);

    if (errors.length > 0) {
      return err(errors as ValidationError[]);
    }

    return ok(ResultUtils.collectSuccesses(results));
  },

  /**
   * Conditional validation - only validate if condition is met
   */
  validateIf: <T>(
    condition: boolean,
    validator: () => ServiceResult<T>,
    defaultValue: T
  ): ServiceResult<T> => {
    if (condition) {
      return validator();
    }
    return ok(defaultValue);
  },

  /**
   * Chain validation - validate second field based on first field result
   */
  chainValidation: <T, U>(
    firstValidator: ServiceResult<T>,
    secondValidator: (firstResult: T) => ServiceResult<U>
  ): Result<{ first: T; second: U }, ApplicationError> => {
    return ResultUtils.chain(firstValidator, firstResult => {
      return ResultUtils.chain(secondValidator(firstResult), secondResult => {
        return ok({ first: firstResult, second: secondResult });
      });
    });
  },
};

/**
 * Common validation patterns with Result types
 */
export const CommonValidations = {
  /**
   * Validate required string field
   */
  requiredString: (
    value: unknown,
    fieldName: string
  ): ServiceResult<string> => {
    if (typeof value !== 'string') {
      return err(
        new ValidationError(`${fieldName} must be a string`, fieldName)
      );
    }
    if (value.trim().length === 0) {
      return err(new ValidationError(`${fieldName} is required`, fieldName));
    }
    return ok(value.trim());
  },

  /**
   * Validate optional string field
   */
  optionalString: (
    value: unknown,
    fieldName: string
  ): ServiceResult<string | undefined> => {
    if (value === undefined || value === null) {
      return ok(undefined);
    }
    if (typeof value !== 'string') {
      return err(
        new ValidationError(`${fieldName} must be a string`, fieldName)
      );
    }
    return ok(value.trim() || undefined);
  },

  /**
   * Validate positive number
   */
  positiveNumber: (
    value: unknown,
    fieldName: string
  ): ServiceResult<number> => {
    if (typeof value !== 'number') {
      return err(
        new ValidationError(`${fieldName} must be a number`, fieldName)
      );
    }
    if (value <= 0) {
      return err(
        new ValidationError(`${fieldName} must be positive`, fieldName)
      );
    }
    return ok(value);
  },

  /**
   * Validate array with minimum length
   */
  nonEmptyArray: <T>(
    value: unknown,
    fieldName: string,
    itemValidator?: (item: unknown) => ServiceResult<T>
  ): ServiceResult<T[]> => {
    if (!Array.isArray(value)) {
      return err(
        new ValidationError(`${fieldName} must be an array`, fieldName)
      );
    }
    if (value.length === 0) {
      return err(
        new ValidationError(`${fieldName} cannot be empty`, fieldName)
      );
    }

    if (itemValidator) {
      const arrayResult = ValidationUtils.validateArray(itemValidator, value);
      if (arrayResult.isErr()) {
        const validationError = new ValidationError(
          `${fieldName} contains invalid items`,
          fieldName,
          undefined,
          { errors: arrayResult.error }
        );
        return err(validationError);
      }
      return ok(arrayResult.value);
    }

    return ok(value as T[]);
  },

  /**
   * Validate enum value
   */
  enumValue: <T extends string>(
    value: unknown,
    fieldName: string,
    allowedValues: readonly T[]
  ): ServiceResult<T> => {
    if (typeof value !== 'string') {
      return err(
        new ValidationError(`${fieldName} must be a string`, fieldName)
      );
    }
    if (!allowedValues.includes(value as T)) {
      return err(
        new ValidationError(
          `${fieldName} must be one of: ${allowedValues.join(', ')}`,
          fieldName,
          undefined,
          { allowedValues, receivedValue: value }
        )
      );
    }
    return ok(value as T);
  },
};

/**
 * Migration helpers for existing code
 */
export const MigrationHelpers = {
  /**
   * Convert boolean-based validation to Result
   */
  fromBoolean: <T>(
    value: T,
    isValid: boolean,
    errorMessage: string,
    fieldName?: string
  ): ServiceResult<T> => {
    if (isValid) {
      return ok(value);
    }
    return err(new ValidationError(errorMessage, fieldName));
  },

  /**
   * Convert try/catch pattern to Result
   */
  fromTryCatch: <T>(
    fn: () => T,
    errorMessage?: string,
    fieldName?: string
  ): ServiceResult<T> => {
    return ResultUtils.fromThrowable(fn, error => {
      if (error instanceof z.ZodError) {
        return ValidationError.fromZodError(error);
      }
      return new ValidationError(
        errorMessage ?? 'Validation failed',
        fieldName,
        undefined,
        { originalError: error }
      );
    });
  },

  /**
   * Convert existing validator structure to Result
   */
  fromValidatorObject: <T>(
    validatorResult: { isValid: boolean; errors: string[]; data?: T },
    fieldName?: string
  ): ServiceResult<T> => {
    if (validatorResult.isValid && validatorResult.data !== undefined) {
      return ok(validatorResult.data);
    }

    const errorMessage =
      validatorResult.errors.join('; ') || 'Validation failed';
    return err(new ValidationError(errorMessage, fieldName));
  },
};
