/**
 * Common validation utilities for branded types.
 *
 * These validators provide runtime safety for branded type constructors,
 * ensuring values meet the expected format and constraints.
 */

/**
 * UUID v4 validation regex.
 * Matches standard UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ULID validation regex.
 * Matches ULID format: 26 characters, Crockford Base32 encoding
 */
const ULID_REGEX = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

/**
 * Nanoid validation regex.
 * Matches default nanoid format: 21 characters, URL-safe alphabet
 */
const NANOID_REGEX = /^[A-Za-z0-9_-]{21}$/;

/**
 * Email validation regex (RFC 5322 compliant subset).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates if a value is a string.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Validates if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.length > 0;
}

/**
 * Validates if a value is a valid UUID v4.
 */
export function isValidUuid(value: unknown): value is string {
  return isString(value) && UUID_V4_REGEX.test(value);
}

/**
 * Validates if a value is a valid ULID.
 */
export function isValidUlid(value: unknown): value is string {
  return isString(value) && ULID_REGEX.test(value);
}

/**
 * Validates if a value is a valid Nanoid.
 */
export function isValidNanoid(value: unknown): value is string {
  return isString(value) && NANOID_REGEX.test(value);
}

/**
 * Validates if a value is a valid email address.
 */
export function isValidEmail(value: unknown): value is string {
  return isString(value) && EMAIL_REGEX.test(value);
}

/**
 * Validates if a value is a positive integer.
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Validates if a value is a non-negative number.
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

/**
 * Creates a string length validator.
 */
export function createStringLengthValidator(
  minLength: number,
  maxLength?: number
): (value: unknown) => value is string {
  return (value: unknown): value is string => {
    if (!isString(value)) return false;
    if (value.length < minLength) return false;
    if (maxLength !== undefined && value.length > maxLength) return false;
    return true;
  };
}

/**
 * Creates a regex pattern validator.
 */
export function createRegexValidator(
  pattern: RegExp
): (value: unknown) => value is string {
  return (value: unknown): value is string =>
    isString(value) && pattern.test(value);
}

/**
 * Creates a composite validator that requires all validators to pass.
 */
export function createAndValidator<T>(
  ...validators: ((value: unknown) => value is T)[]
): (value: unknown) => value is T {
  return (value: unknown): value is T =>
    validators.every(validator => validator(value));
}

/**
 * Creates a composite validator that requires any validator to pass.
 */
export function createOrValidator<T>(
  ...validators: ((value: unknown) => value is T)[]
): (value: unknown) => value is T {
  return (value: unknown): value is T =>
    validators.some(validator => validator(value));
}

/**
 * Common error messages for validation failures.
 */
export const ValidationErrors = {
  NOT_STRING: (value: unknown) => `Expected string, got ${typeof value}`,
  EMPTY_STRING: () => 'String cannot be empty',
  INVALID_UUID: (value: unknown) => `Invalid UUID format: ${String(value)}`,
  INVALID_ULID: (value: unknown) => `Invalid ULID format: ${String(value)}`,
  INVALID_NANOID: (value: unknown) => `Invalid Nanoid format: ${String(value)}`,
  INVALID_EMAIL: (value: unknown) => `Invalid email format: ${String(value)}`,
  INVALID_LENGTH: (value: unknown, min: number, max?: number) =>
    max
      ? `String length must be between ${min} and ${max}, got ${String(value).length}`
      : `String length must be at least ${min}, got ${String(value).length}`,
  NOT_POSITIVE_INTEGER: (value: unknown) =>
    `Expected positive integer, got ${String(value)}`,
  NOT_NON_NEGATIVE_NUMBER: (value: unknown) =>
    `Expected non-negative number, got ${String(value)}`,
} as const;
