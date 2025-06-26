/**
 * Tests for validation utilities.
 *
 * Comprehensive tests for all validation functions used by
 * branded type constructors.
 */

import { describe, it, expect } from 'vitest';
import { propertyTest, generators } from '../src/index.js';
import fc from 'fast-check';

import {
  isString,
  isNonEmptyString,
  isValidUuid,
  isValidUlid,
  isValidNanoid,
  isValidEmail,
  isPositiveInteger,
  isNonNegativeNumber,
  createStringLengthValidator,
  createRegexValidator,
  createAndValidator,
  createOrValidator,
  ValidationErrors,
} from '../src/validators.js';

describe('Validation Utilities', () => {
  describe('isString', () => {
    it('should validate string values', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString('   ')).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(true)).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
      expect(isNonEmptyString('   ')).toBe(true); // Whitespace counts as non-empty
    });

    it('should reject empty strings and non-strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
    });
  });

  describe('isValidUuid', () => {
    it('should validate correct UUID v4 format', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUuid('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toBe(true);
      expect(isValidUuid('123e4567-e89b-42d3-a456-426614174000')).toBe(true);

      // UUID v4 specifically (4 in third group)
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUID formats', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false); // Too short
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(
        false
      ); // Too long
      expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false); // No hyphens
      expect(isValidUuid('550e8400-e29b-41d4-a716-44665544000g')).toBe(false); // Invalid hex
      expect(isValidUuid('')).toBe(false);
      expect(isValidUuid(123)).toBe(false);
    });
  });

  describe('isValidUlid', () => {
    it('should validate correct ULID format', () => {
      expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true);
      expect(isValidUlid('01ARYZ6S41TSV4RRFFQ69G5FAV')).toBe(true);
      expect(isValidUlid('00000000000000000000000000')).toBe(true);
      expect(isValidUlid('7ZZZZZZZZZZZZZZZZZZZZZZZZZ')).toBe(true);
    });

    it('should reject invalid ULID formats', () => {
      expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FA')).toBe(false); // Too short
      expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAVV')).toBe(false); // Too long
      expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5F@V')).toBe(false); // Invalid char
      expect(isValidUlid('01arz3ndektsv4rrffq69g5fav')).toBe(false); // Lowercase
      expect(isValidUlid('')).toBe(false);
      expect(isValidUlid(123)).toBe(false);
    });
  });

  describe('isValidNanoid', () => {
    it('should validate correct Nanoid format', () => {
      expect(isValidNanoid('V1StGXR8_Z5jdHi6B-myT')).toBe(true);
      expect(isValidNanoid('FyPX4j7ZPCS_aXIkPJ5lN')).toBe(true);
      expect(isValidNanoid('abcdefghijklmnopqrstu')).toBe(true);
      expect(isValidNanoid('ABCDEFGHIJKLMNOPQRSTU')).toBe(true);
      expect(isValidNanoid('0123456789_-ABCDEFGHI')).toBe(true);
    });

    it('should reject invalid Nanoid formats', () => {
      expect(isValidNanoid('V1StGXR8_Z5jdHi6B-myTT')).toBe(false); // Too long
      expect(isValidNanoid('V1StGXR8_Z5jdHi6B-myT#')).toBe(false); // Invalid char
      expect(isValidNanoid('V1StGXR8_Z5jdHi6B-my')).toBe(false); // Too short
      expect(isValidNanoid('')).toBe(false);
      expect(isValidNanoid(123)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
      expect(isValidEmail('123@456.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false); // Space
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    it('should validate positive integers', () => {
      expect(isPositiveInteger(1)).toBe(true);
      expect(isPositiveInteger(42)).toBe(true);
      expect(isPositiveInteger(999999)).toBe(true);
    });

    it('should reject non-positive integers and non-integers', () => {
      expect(isPositiveInteger(0)).toBe(false); // Zero is not positive
      expect(isPositiveInteger(-1)).toBe(false);
      expect(isPositiveInteger(1.5)).toBe(false); // Not integer
      expect(isPositiveInteger(NaN)).toBe(false);
      expect(isPositiveInteger(Infinity)).toBe(false);
      expect(isPositiveInteger('1')).toBe(false); // String
      expect(isPositiveInteger(null)).toBe(false);
    });
  });

  describe('isNonNegativeNumber', () => {
    it('should validate non-negative numbers', () => {
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(1)).toBe(true);
      expect(isNonNegativeNumber(1.5)).toBe(true);
      expect(isNonNegativeNumber(0.0)).toBe(true);
    });

    it('should reject negative numbers and non-numbers', () => {
      expect(isNonNegativeNumber(-1)).toBe(false);
      expect(isNonNegativeNumber(-0.1)).toBe(false);
      expect(isNonNegativeNumber(NaN)).toBe(false);
      expect(isNonNegativeNumber('0')).toBe(false); // String
      expect(isNonNegativeNumber(null)).toBe(false);
      expect(isNonNegativeNumber(undefined)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isNonNegativeNumber(Infinity)).toBe(true);
      expect(isNonNegativeNumber(-Infinity)).toBe(false);
    });
  });

  describe('createStringLengthValidator', () => {
    it('should create validator with minimum length only', () => {
      const minLength5 = createStringLengthValidator(5);

      expect(minLength5('hello')).toBe(true); // Exactly 5
      expect(minLength5('hello world')).toBe(true); // More than 5
      expect(minLength5('hi')).toBe(false); // Less than 5
      expect(minLength5('')).toBe(false); // Empty
      expect(minLength5(123)).toBe(false); // Not string
    });

    it('should create validator with minimum and maximum length', () => {
      const length5to10 = createStringLengthValidator(5, 10);

      expect(length5to10('hello')).toBe(true); // Exactly 5
      expect(length5to10('hello!')).toBe(true); // Between 5-10
      expect(length5to10('hello!!!!')).toBe(true); // Exactly 10
      expect(length5to10('hi')).toBe(false); // Less than 5
      expect(length5to10('hello world!')).toBe(false); // More than 10
    });

    it('should handle edge cases', () => {
      const length0to5 = createStringLengthValidator(0, 5);

      expect(length0to5('')).toBe(true); // Empty string with min 0
      expect(length0to5('hello')).toBe(true);
      expect(length0to5('toolong')).toBe(false);
    });
  });

  describe('createRegexValidator', () => {
    it('should create validator with custom regex', () => {
      const hexValidator = createRegexValidator(/^[0-9a-fA-F]+$/);

      expect(hexValidator('abc123')).toBe(true);
      expect(hexValidator('ABC123')).toBe(true);
      expect(hexValidator('0123456789abcdefABCDEF')).toBe(true);
      expect(hexValidator('xyz')).toBe(false); // Invalid hex chars
      expect(hexValidator('')).toBe(false); // Empty doesn't match +
      expect(hexValidator(123)).toBe(false); // Not string
    });

    it('should work with complex patterns', () => {
      const phoneValidator = createRegexValidator(/^\+?[1-9]\d{1,14}$/);

      expect(phoneValidator('+1234567890')).toBe(true);
      expect(phoneValidator('1234567890')).toBe(true);
      expect(phoneValidator('+12345')).toBe(true);
      expect(phoneValidator('01234567890')).toBe(false); // Starts with 0
      expect(phoneValidator('phone')).toBe(false);
    });
  });

  describe('createAndValidator', () => {
    it('should require all validators to pass', () => {
      const stringAndLength = createAndValidator(
        isString,
        createStringLengthValidator(3, 10)
      );

      expect(stringAndLength('hello')).toBe(true); // String and correct length
      expect(stringAndLength('hi')).toBe(false); // String but too short
      expect(stringAndLength(123)).toBe(false); // Not string
      expect(stringAndLength('this is too long')).toBe(false); // String but too long
    });

    it('should work with multiple validators', () => {
      const strictValidator = createAndValidator(
        isString,
        isNonEmptyString,
        createStringLengthValidator(5, 20),
        createRegexValidator(/^[a-zA-Z]+$/)
      );

      expect(strictValidator('hello')).toBe(true);
      expect(strictValidator('HelloWorld')).toBe(true);
      expect(strictValidator('hello123')).toBe(false); // Contains numbers
      expect(strictValidator('hi')).toBe(false); // Too short
      expect(strictValidator('')).toBe(false); // Empty
    });
  });

  describe('createOrValidator', () => {
    it('should require any validator to pass', () => {
      const stringOrNumber = createOrValidator(
        isString,
        (value): value is number => typeof value === 'number'
      );

      expect(stringOrNumber('hello')).toBe(true);
      expect(stringOrNumber(123)).toBe(true);
      expect(stringOrNumber(null)).toBe(false);
      expect(stringOrNumber({})).toBe(false);
    });

    it('should work with multiple options', () => {
      const idValidator = createOrValidator(
        isValidUuid,
        isValidUlid,
        isValidNanoid
      );

      expect(idValidator('550e8400-e29b-41d4-a716-446655440000')).toBe(true); // UUID
      expect(idValidator('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true); // ULID
      expect(idValidator('V1StGXR8_Z5jdHi6B-myT')).toBe(true); // Nanoid
      expect(idValidator('invalid-id')).toBe(false);
    });
  });

  describe('ValidationErrors', () => {
    it('should provide meaningful error messages', () => {
      expect(ValidationErrors.NOT_STRING(123)).toBe(
        'Expected string, got number'
      );
      expect(ValidationErrors.NOT_STRING(null)).toBe(
        'Expected string, got object'
      );

      expect(ValidationErrors.EMPTY_STRING()).toBe('String cannot be empty');

      expect(ValidationErrors.INVALID_UUID('not-uuid')).toBe(
        'Invalid UUID format: not-uuid'
      );
      expect(ValidationErrors.INVALID_ULID('not-ulid')).toBe(
        'Invalid ULID format: not-ulid'
      );
      expect(ValidationErrors.INVALID_NANOID('not-nanoid')).toBe(
        'Invalid Nanoid format: not-nanoid'
      );
      expect(ValidationErrors.INVALID_EMAIL('not-email')).toBe(
        'Invalid email format: not-email'
      );

      expect(ValidationErrors.INVALID_LENGTH('short', 5)).toBe(
        'String length must be at least 5, got 5'
      );
      expect(ValidationErrors.INVALID_LENGTH('short', 10, 20)).toBe(
        'String length must be between 10 and 20, got 5'
      );

      expect(ValidationErrors.NOT_POSITIVE_INTEGER(-1)).toBe(
        'Expected positive integer, got -1'
      );
      expect(ValidationErrors.NOT_NON_NEGATIVE_NUMBER(-1)).toBe(
        'Expected non-negative number, got -1'
      );
    });
  });

  describe('Performance', () => {
    it('should validate efficiently', () => {
      const testData = Array.from({ length: 10000 }, (_, i) => `test-${i}`);

      const start = performance.now();

      for (const item of testData) {
        isString(item);
        isNonEmptyString(item);
        isValidEmail(`${item}@example.com`);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete quickly (under 50ms for 10k operations)
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined consistently', () => {
      const validators = [
        isString,
        isNonEmptyString,
        isValidUuid,
        isValidUlid,
        isValidNanoid,
        isValidEmail,
        isPositiveInteger,
        isNonNegativeNumber,
      ];

      for (const validator of validators) {
        expect(validator(null)).toBe(false);
        expect(validator(undefined)).toBe(false);
      }
    });

    it('should handle special string values', () => {
      const specialStrings = [
        '',
        ' ',
        '\n',
        '\t',
        '0',
        'false',
        'null',
        'undefined',
      ];

      for (const str of specialStrings) {
        expect(isString(str)).toBe(true);

        if (str === '') {
          expect(isNonEmptyString(str)).toBe(false);
        } else {
          expect(isNonEmptyString(str)).toBe(true);
        }
      }
    });

    it('should handle special number values', () => {
      expect(isPositiveInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isNonNegativeNumber(Number.MIN_VALUE)).toBe(true);
      expect(isPositiveInteger(Number.MAX_VALUE)).toBe(true);

      expect(isPositiveInteger(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isNonNegativeNumber(Number.POSITIVE_INFINITY)).toBe(true);
      expect(isNonNegativeNumber(Number.NEGATIVE_INFINITY)).toBe(false);
    });
  });
});

// ===== Property-Based Tests =====

describe('Validation Utilities - Property Tests', () => {
  describe('isString - Property Tests', () => {
    it('should always return boolean for any input', () => {
      fc.assert(
        fc.property(fc.anything(), input => {
          const result = isString(input);
          expect(typeof result).toBe('boolean');
        })
      );
    });

    it('should return true for all string inputs', () => {
      fc.assert(
        fc.property(fc.string(), input => {
          const result = isString(input);
          expect(result).toBe(true);
        })
      );
    });
  });

  describe('isNonEmptyString - Property Tests', () => {
    it('should consistently validate non-empty strings', () => {
      fc.assert(
        fc.property(fc.string(), input => {
          const result = isNonEmptyString(input);
          const expected = input.length > 0;
          expect(result).toBe(expected);
        })
      );
    });
  });

  describe('isValidUuid - Property Tests', () => {
    it('should always return boolean for any input', () => {
      fc.assert(
        fc.property(fc.string(), input => {
          const result = isValidUuid(input);
          expect(typeof result).toBe('boolean');
        })
      );
    });
  });

  describe('isValidEmail - Property Tests', () => {
    it('should always return boolean for any input', () => {
      fc.assert(
        fc.property(fc.string(), input => {
          const result = isValidEmail(input);
          expect(typeof result).toBe('boolean');
        })
      );
    });
  });

  describe('isPositiveInteger - Property Tests', () => {
    it('should validate positive integers correctly', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), num => {
          const result = isPositiveInteger(num);
          expect(result).toBe(true);
        })
      );
    });

    it('should reject non-positive and non-integer numbers', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -1000, max: 0 }), // Non-positive integers
            fc
              .float({ min: Math.fround(0.1), max: Math.fround(1000) })
              .filter(n => !Number.isInteger(n)) // Only non-integers
          ),
          num => {
            const result = isPositiveInteger(num);
            expect(result).toBe(false);
          }
        )
      );
    });
  });

  describe('isNonNegativeNumber - Property Tests', () => {
    it('should validate non-negative numbers correctly', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(1000), noNaN: true }),
          num => {
            const result = isNonNegativeNumber(num);
            expect(result).toBe(true);
          }
        )
      );
    });
  });

  describe('createStringLengthValidator - Property Tests', () => {
    it('should validate string lengths correctly', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 10, maxLength: 20 }),
            fc.integer({ min: 5, max: 15 })
          ),
          ([str, minLen]) => {
            const validator = createStringLengthValidator(minLen);
            const result = validator(str);
            const expected = str.length >= minLen;
            expect(result).toBe(expected);
          }
        )
      );
    });
  });

  describe('createRegexValidator - Property Tests', () => {
    it('should validate regex patterns correctly', () => {
      fc.assert(
        fc.property(fc.string(), str => {
          const validator = createRegexValidator(/^[a-zA-Z]+$/);
          const result = validator(str);
          const expected = /^[a-zA-Z]+$/.test(str);
          expect(result).toBe(expected);
        })
      );
    });
  });
});
