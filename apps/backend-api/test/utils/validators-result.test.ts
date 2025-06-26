/**
 * Tests for Result-based validation utilities
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateEmail,
  validateUrl,
  validatePhoneNumber,
  validatePassword,
  validatePasswordWithDetails,
  validateUserRegistration,
  validateUserProfileUpdate,
  ValidationUtils,
  CommonValidations,
  MigrationHelpers,
} from '../../src/utils/validators-result.js';
import { ValidationError } from '../../src/utils/result.js';

describe('Result-based Validators', () => {
  describe('Basic Validators', () => {
    describe('validateEmail', () => {
      it('should validate correct email', () => {
        const result = validateEmail('user@example.com');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('user@example.com');
        }
      });

      it('should reject invalid email', () => {
        const result = validateEmail('invalid-email');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toContain('Invalid email');
        }
      });

      it('should reject empty email', () => {
        const result = validateEmail('');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe('validateUrl', () => {
      it('should validate correct URL', () => {
        const result = validateUrl('https://example.com');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('https://example.com');
        }
      });

      it('should reject invalid URL', () => {
        const result = validateUrl('not-a-url');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toContain('Invalid URL');
        }
      });
    });

    describe('validatePhoneNumber', () => {
      it('should validate US phone number', () => {
        const result = validatePhoneNumber('(555) 123-4567');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('(555) 123-4567');
        }
      });

      it('should validate phone number with plus', () => {
        const result = validatePhoneNumber('+1-555-123-4567');

        expect(result.isOk()).toBe(true);
      });

      it('should reject invalid phone number', () => {
        const result = validatePhoneNumber('123');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toContain('Invalid phone number');
        }
      });
    });

    describe('validatePassword', () => {
      it('should validate strong password', () => {
        const result = validatePassword('StrongPass123!');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('StrongPass123!');
        }
      });

      it('should reject weak password', () => {
        const result = validatePassword('weak');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe('validatePasswordWithDetails', () => {
      it('should validate strong password with details', () => {
        const result = validatePasswordWithDetails('StrongPass123!');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('StrongPass123!');
        }
      });

      it('should provide detailed error context', () => {
        const result = validatePasswordWithDetails('weak');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.field).toBe('password');
          expect(result.error.context).toHaveProperty('requirements');
          expect(result.error.context).toHaveProperty('failedCount');
          expect(result.error.details).toBeDefined();
        }
      });
    });
  });

  describe('Complex Validators', () => {
    describe('validateUserRegistration', () => {
      it('should validate complete user registration', () => {
        const userData = {
          email: 'user@example.com',
          password: 'StrongPass123!',
          name: 'John Doe',
          phone: '(555) 123-4567',
        };

        const result = validateUserRegistration(userData);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual(userData);
        }
      });

      it('should validate user registration without optional phone', () => {
        const userData = {
          email: 'user@example.com',
          password: 'StrongPass123!',
          name: 'John Doe',
        };

        const result = validateUserRegistration(userData);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual(userData);
        }
      });

      it('should reject registration with invalid email', () => {
        const userData = {
          email: 'invalid-email',
          password: 'StrongPass123!',
          name: 'John Doe',
        };

        const result = validateUserRegistration(userData);

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.details?.issues[0]?.path).toEqual(['email']);
        }
      });

      it('should reject registration with missing required fields', () => {
        const userData = {
          email: 'user@example.com',
          // missing password and name
        };

        const result = validateUserRegistration(userData);

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.details?.issues.length).toBeGreaterThan(1);
        }
      });

      it('should reject registration with weak password', () => {
        const userData = {
          email: 'user@example.com',
          password: 'weak',
          name: 'John Doe',
        };

        const result = validateUserRegistration(userData);

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(
            result.error.details?.issues.some(issue =>
              issue.path.includes('password')
            )
          ).toBe(true);
        }
      });
    });

    describe('validateUserProfileUpdate', () => {
      it('should validate partial profile update', () => {
        const updateData = {
          name: 'Jane Doe',
        };

        const result = validateUserProfileUpdate(updateData);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual(updateData);
        }
      });

      it('should validate complete profile update', () => {
        const updateData = {
          email: 'newemail@example.com',
          name: 'Jane Doe',
          phone: '(555) 987-6543',
        };

        const result = validateUserProfileUpdate(updateData);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual(updateData);
        }
      });

      it('should validate empty update', () => {
        const updateData = {};

        const result = validateUserProfileUpdate(updateData);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual({});
        }
      });

      it('should reject invalid email in update', () => {
        const updateData = {
          email: 'invalid-email',
          name: 'Jane Doe',
        };

        const result = validateUserProfileUpdate(updateData);

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.details?.issues[0]?.path).toEqual(['email']);
        }
      });
    });
  });

  describe('ValidationUtils', () => {
    describe('validateFields', () => {
      it('should validate all fields successfully', () => {
        const fields = {
          email: (value: string) => validateEmail(value),
          name: (value: string) =>
            CommonValidations.requiredString(value, 'name'),
        };

        const data = {
          email: 'user@example.com',
          name: 'John Doe',
        };

        const result = ValidationUtils.validateFields(fields, data);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual(data);
        }
      });

      it('should collect all validation errors', () => {
        const fields = {
          email: (value: string) => validateEmail(value),
          name: (value: string) =>
            CommonValidations.requiredString(value, 'name'),
        };

        const data = {
          email: 'invalid-email',
          name: '',
        };

        const result = ValidationUtils.validateFields(fields, data);

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toHaveLength(2);
          expect(result.error.every(e => e instanceof ValidationError)).toBe(
            true
          );
        }
      });
    });

    describe('validateArray', () => {
      it('should validate array of items', () => {
        const items = ['user1@example.com', 'user2@example.com'];
        const result = ValidationUtils.validateArray(validateEmail, items);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual(items);
        }
      });

      it('should collect array validation errors', () => {
        const items = ['valid@example.com', 'invalid-email'];
        const result = ValidationUtils.validateArray(validateEmail, items);

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toHaveLength(1);
          expect(result.error[0]).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe('validateIf', () => {
      it('should validate when condition is true', () => {
        const result = ValidationUtils.validateIf(
          true,
          () => validateEmail('user@example.com'),
          'default@example.com'
        );

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('user@example.com');
        }
      });

      it('should return default when condition is false', () => {
        const result = ValidationUtils.validateIf(
          false,
          () => validateEmail('invalid-email'),
          'default@example.com'
        );

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('default@example.com');
        }
      });
    });

    describe('chainValidation', () => {
      it('should chain successful validations', () => {
        const firstResult = validateEmail('user@example.com');
        const result = ValidationUtils.chainValidation(firstResult, email =>
          CommonValidations.requiredString(email.split('@')[0], 'username')
        );

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value.first).toBe('user@example.com');
          expect(result.value.second).toBe('user');
        }
      });

      it('should stop on first validation failure', () => {
        const firstResult = validateEmail('invalid-email');
        const result = ValidationUtils.chainValidation(firstResult, email =>
          CommonValidations.requiredString(email.split('@')[0], 'username')
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
        }
      });
    });
  });

  describe('CommonValidations', () => {
    describe('requiredString', () => {
      it('should validate non-empty string', () => {
        const result = CommonValidations.requiredString('hello', 'field');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('hello');
        }
      });

      it('should trim whitespace', () => {
        const result = CommonValidations.requiredString('  hello  ', 'field');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('hello');
        }
      });

      it('should reject non-string values', () => {
        const result = CommonValidations.requiredString(123 as any, 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be a string');
        }
      });

      it('should reject empty strings', () => {
        const result = CommonValidations.requiredString('', 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('is required');
        }
      });

      it('should reject whitespace-only strings', () => {
        const result = CommonValidations.requiredString('   ', 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('is required');
        }
      });
    });

    describe('optionalString', () => {
      it('should validate non-empty string', () => {
        const result = CommonValidations.optionalString('hello', 'field');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('hello');
        }
      });

      it('should return undefined for null/undefined', () => {
        const result1 = CommonValidations.optionalString(null, 'field');
        const result2 = CommonValidations.optionalString(undefined, 'field');

        expect(result1.isOk()).toBe(true);
        expect(result2.isOk()).toBe(true);
        if (result1.isOk() && result2.isOk()) {
          expect(result1.value).toBeUndefined();
          expect(result2.value).toBeUndefined();
        }
      });

      it('should return undefined for empty string', () => {
        const result = CommonValidations.optionalString('', 'field');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBeUndefined();
        }
      });

      it('should reject non-string values', () => {
        const result = CommonValidations.optionalString(123 as any, 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be a string');
        }
      });
    });

    describe('positiveNumber', () => {
      it('should validate positive number', () => {
        const result = CommonValidations.positiveNumber(5, 'field');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe(5);
        }
      });

      it('should reject zero', () => {
        const result = CommonValidations.positiveNumber(0, 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be positive');
        }
      });

      it('should reject negative numbers', () => {
        const result = CommonValidations.positiveNumber(-5, 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be positive');
        }
      });

      it('should reject non-numbers', () => {
        const result = CommonValidations.positiveNumber('5' as any, 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be a number');
        }
      });
    });

    describe('nonEmptyArray', () => {
      it('should validate non-empty array', () => {
        const result = CommonValidations.nonEmptyArray([1, 2, 3], 'field');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual([1, 2, 3]);
        }
      });

      it('should validate array items with validator', () => {
        const items = ['user1@example.com', 'user2@example.com'];
        const result = CommonValidations.nonEmptyArray(
          items,
          'emails',
          validateEmail
        );

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toEqual(items);
        }
      });

      it('should reject empty array', () => {
        const result = CommonValidations.nonEmptyArray([], 'field');

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('cannot be empty');
        }
      });

      it('should reject non-arrays', () => {
        const result = CommonValidations.nonEmptyArray(
          'not-array' as any,
          'field'
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be an array');
        }
      });

      it('should return validation errors for invalid items', () => {
        const items = ['valid@example.com', 'invalid-email'];
        const result = CommonValidations.nonEmptyArray(
          items,
          'emails',
          validateEmail
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.context?.errors).toBeDefined();
          expect(Array.isArray(result.error.context?.errors)).toBe(true);
          expect(
            (result.error.context?.errors as ValidationError[])[0]
          ).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe('enumValue', () => {
      it('should validate valid enum value', () => {
        const allowedValues = ['red', 'green', 'blue'] as const;
        const result = CommonValidations.enumValue(
          'red',
          'color',
          allowedValues
        );

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('red');
        }
      });

      it('should reject invalid enum value', () => {
        const allowedValues = ['red', 'green', 'blue'] as const;
        const result = CommonValidations.enumValue(
          'yellow',
          'color',
          allowedValues
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be one of');
          expect(result.error.context?.allowedValues).toEqual(allowedValues);
          expect(result.error.context?.receivedValue).toBe('yellow');
        }
      });

      it('should reject non-string values', () => {
        const allowedValues = ['red', 'green', 'blue'] as const;
        const result = CommonValidations.enumValue(
          123 as any,
          'color',
          allowedValues
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toContain('must be a string');
        }
      });
    });
  });

  describe('MigrationHelpers', () => {
    describe('fromBoolean', () => {
      it('should convert successful boolean validation', () => {
        const result = MigrationHelpers.fromBoolean(
          'test',
          true,
          'Error message'
        );

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('test');
        }
      });

      it('should convert failed boolean validation', () => {
        const result = MigrationHelpers.fromBoolean(
          'test',
          false,
          'Error message',
          'field'
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toBe('Error message');
          expect(result.error.field).toBe('field');
        }
      });
    });

    describe('fromTryCatch', () => {
      it('should convert successful try/catch', () => {
        const result = MigrationHelpers.fromTryCatch(() => 'success');

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('success');
        }
      });

      it('should convert throwing function', () => {
        const result = MigrationHelpers.fromTryCatch(
          () => {
            throw new Error('Test error');
          },
          'Custom error message',
          'field'
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toBe('Custom error message');
          expect(result.error.field).toBe('field');
        }
      });

      it('should handle ZodError specially', () => {
        const schema = z.object({ email: z.string().email() });
        const result = MigrationHelpers.fromTryCatch(() => {
          return schema.parse({ email: 'invalid' });
        });

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.details).toBeDefined();
        }
      });
    });

    describe('fromValidatorObject', () => {
      it('should convert successful validator object', () => {
        const validatorResult = {
          isValid: true,
          errors: [],
          data: 'success',
        };

        const result = MigrationHelpers.fromValidatorObject(validatorResult);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value).toBe('success');
        }
      });

      it('should convert failed validator object', () => {
        const validatorResult = {
          isValid: false,
          errors: ['Error 1', 'Error 2'],
        };

        const result = MigrationHelpers.fromValidatorObject(
          validatorResult,
          'field'
        );

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBeInstanceOf(ValidationError);
          expect(result.error.message).toBe('Error 1; Error 2');
          expect(result.error.field).toBe('field');
        }
      });

      it('should handle empty errors array', () => {
        const validatorResult = {
          isValid: false,
          errors: [],
        };

        const result = MigrationHelpers.fromValidatorObject(validatorResult);

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toBe('Validation failed');
        }
      });
    });
  });
});
