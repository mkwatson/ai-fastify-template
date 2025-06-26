/**
 * Common entity ID types with branded type safety.
 * 
 * These branded types prevent ID mixups at compile time while providing
 * runtime validation for safety. Each ID type has its own constructor
 * with appropriate validation.
 */

import {
  type Brand,
  createBrandConstructor,
  createUnsafeBrandConstructor,
} from './brand.js';
import {
  isValidUuid,
  isValidEmail,
  isNonEmptyString,
  ValidationErrors,
} from './validators.js';

// ============================================================================
// User Management Domain
// ============================================================================

/**
 * Branded type for user identifiers.
 * Prevents mixing user IDs with other entity IDs.
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * Constructor for UserId with UUID validation.
 * 
 * @example
 * ```typescript
 * const userId = UserId('550e8400-e29b-41d4-a716-446655440000');
 * // Compile error: Cannot assign OrderId to function expecting UserId
 * processUser(orderId); // ❌ Type error
 * processUser(userId);  // ✅ Type safe
 * ```
 */
export const UserId = createBrandConstructor<string, 'UserId'>({
  name: 'UserId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for UserId (skips validation).
 * Use only when certain the value is valid (e.g., from database).
 */
export const UnsafeUserId = createUnsafeBrandConstructor<string, 'UserId'>();

/**
 * Branded type for session identifiers.
 */
export type SessionId = Brand<string, 'SessionId'>;

/**
 * Constructor for SessionId with UUID validation.
 */
export const SessionId = createBrandConstructor<string, 'SessionId'>({
  name: 'SessionId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for SessionId.
 */
export const UnsafeSessionId = createUnsafeBrandConstructor<string, 'SessionId'>();

/**
 * Branded type for role identifiers.
 */
export type RoleId = Brand<string, 'RoleId'>;

/**
 * Constructor for RoleId with non-empty string validation.
 */
export const RoleId = createBrandConstructor<string, 'RoleId'>({
  name: 'RoleId',
  validate: isNonEmptyString,
  errorMessage: ValidationErrors.EMPTY_STRING,
});

/**
 * Unsafe constructor for RoleId.
 */
export const UnsafeRoleId = createUnsafeBrandConstructor<string, 'RoleId'>();

// ============================================================================
// E-commerce Domain
// ============================================================================

/**
 * Branded type for product identifiers.
 */
export type ProductId = Brand<string, 'ProductId'>;

/**
 * Constructor for ProductId with UUID validation.
 */
export const ProductId = createBrandConstructor<string, 'ProductId'>({
  name: 'ProductId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for ProductId.
 */
export const UnsafeProductId = createUnsafeBrandConstructor<string, 'ProductId'>();

/**
 * Branded type for order identifiers.
 */
export type OrderId = Brand<string, 'OrderId'>;

/**
 * Constructor for OrderId with UUID validation.
 */
export const OrderId = createBrandConstructor<string, 'OrderId'>({
  name: 'OrderId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for OrderId.
 */
export const UnsafeOrderId = createUnsafeBrandConstructor<string, 'OrderId'>();

/**
 * Branded type for customer identifiers.
 */
export type CustomerId = Brand<string, 'CustomerId'>;

/**
 * Constructor for CustomerId with UUID validation.
 */
export const CustomerId = createBrandConstructor<string, 'CustomerId'>({
  name: 'CustomerId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for CustomerId.
 */
export const UnsafeCustomerId = createUnsafeBrandConstructor<string, 'CustomerId'>();

/**
 * Branded type for category identifiers.
 */
export type CategoryId = Brand<string, 'CategoryId'>;

/**
 * Constructor for CategoryId with non-empty string validation.
 */
export const CategoryId = createBrandConstructor<string, 'CategoryId'>({
  name: 'CategoryId',
  validate: isNonEmptyString,
  errorMessage: ValidationErrors.EMPTY_STRING,
});

/**
 * Unsafe constructor for CategoryId.
 */
export const UnsafeCategoryId = createUnsafeBrandConstructor<string, 'CategoryId'>();

// ============================================================================
// Content Management Domain
// ============================================================================

/**
 * Branded type for article identifiers.
 */
export type ArticleId = Brand<string, 'ArticleId'>;

/**
 * Constructor for ArticleId with UUID validation.
 */
export const ArticleId = createBrandConstructor<string, 'ArticleId'>({
  name: 'ArticleId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for ArticleId.
 */
export const UnsafeArticleId = createUnsafeBrandConstructor<string, 'ArticleId'>();

/**
 * Branded type for comment identifiers.
 */
export type CommentId = Brand<string, 'CommentId'>;

/**
 * Constructor for CommentId with UUID validation.
 */
export const CommentId = createBrandConstructor<string, 'CommentId'>({
  name: 'CommentId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for CommentId.
 */
export const UnsafeCommentId = createUnsafeBrandConstructor<string, 'CommentId'>();

/**
 * Branded type for author identifiers.
 */
export type AuthorId = Brand<string, 'AuthorId'>;

/**
 * Constructor for AuthorId with UUID validation.
 */
export const AuthorId = createBrandConstructor<string, 'AuthorId'>({
  name: 'AuthorId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for AuthorId.
 */
export const UnsafeAuthorId = createUnsafeBrandConstructor<string, 'AuthorId'>();

// ============================================================================
// System Resource Domain
// ============================================================================

/**
 * Branded type for request identifiers.
 */
export type RequestId = Brand<string, 'RequestId'>;

/**
 * Constructor for RequestId with UUID validation.
 */
export const RequestId = createBrandConstructor<string, 'RequestId'>({
  name: 'RequestId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for RequestId.
 */
export const UnsafeRequestId = createUnsafeBrandConstructor<string, 'RequestId'>();

/**
 * Branded type for transaction identifiers.
 */
export type TransactionId = Brand<string, 'TransactionId'>;

/**
 * Constructor for TransactionId with UUID validation.
 */
export const TransactionId = createBrandConstructor<string, 'TransactionId'>({
  name: 'TransactionId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for TransactionId.
 */
export const UnsafeTransactionId = createUnsafeBrandConstructor<string, 'TransactionId'>();

/**
 * Branded type for log entry identifiers.
 */
export type LogId = Brand<string, 'LogId'>;

/**
 * Constructor for LogId with UUID validation.
 */
export const LogId = createBrandConstructor<string, 'LogId'>({
  name: 'LogId',
  validate: isValidUuid,
  errorMessage: ValidationErrors.INVALID_UUID,
});

/**
 * Unsafe constructor for LogId.
 */
export const UnsafeLogId = createUnsafeBrandConstructor<string, 'LogId'>();

// ============================================================================
// Alternative ID Types (Non-UUID)
// ============================================================================

/**
 * Branded type for email addresses (used as natural keys).
 */
export type EmailAddress = Brand<string, 'EmailAddress'>;

/**
 * Constructor for EmailAddress with email validation.
 */
export const EmailAddress = createBrandConstructor<string, 'EmailAddress'>({
  name: 'EmailAddress',
  validate: isValidEmail,
  errorMessage: ValidationErrors.INVALID_EMAIL,
});

/**
 * Unsafe constructor for EmailAddress.
 */
export const UnsafeEmailAddress = createUnsafeBrandConstructor<string, 'EmailAddress'>();

/**
 * Branded type for slug identifiers (URL-friendly strings).
 */
export type Slug = Brand<string, 'Slug'>;

/**
 * Slug validation: lowercase letters, numbers, hyphens only.
 */
const isValidSlug = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z0-9-]+$/.test(value) && value.length > 0;

/**
 * Constructor for Slug with format validation.
 */
export const Slug = createBrandConstructor<string, 'Slug'>({
  name: 'Slug',
  validate: isValidSlug,
  errorMessage: (value: unknown) =>
    `Invalid slug format: ${String(value)}. Must contain only lowercase letters, numbers, and hyphens.`,
});

/**
 * Unsafe constructor for Slug.
 */
export const UnsafeSlug = createUnsafeBrandConstructor<string, 'Slug'>();

// ============================================================================
// Type Guards and Utilities
// ============================================================================

/**
 * Union type of all entity ID types for generic handling.
 */
export type AnyEntityId =
  | UserId
  | SessionId
  | RoleId
  | ProductId
  | OrderId
  | CustomerId
  | CategoryId
  | ArticleId
  | CommentId
  | AuthorId
  | RequestId
  | TransactionId
  | LogId
  | EmailAddress
  | Slug;

/**
 * Type guard to check if a value is any kind of entity ID.
 * Note: This is primarily for documentation since brands are phantom.
 */
export function isEntityId(value: unknown): value is AnyEntityId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Extract all entity ID constructor names for validation.
 */
export const EntityIdConstructors = {
  UserId,
  SessionId,
  RoleId,
  ProductId,
  OrderId,
  CustomerId,
  CategoryId,
  ArticleId,
  CommentId,
  AuthorId,
  RequestId,
  TransactionId,
  LogId,
  EmailAddress,
  Slug,
} as const;

/**
 * Extract all unsafe entity ID constructors.
 */
export const UnsafeEntityIdConstructors = {
  UnsafeUserId,
  UnsafeSessionId,
  UnsafeRoleId,
  UnsafeProductId,
  UnsafeOrderId,
  UnsafeCustomerId,
  UnsafeCategoryId,
  UnsafeArticleId,
  UnsafeCommentId,
  UnsafeAuthorId,
  UnsafeRequestId,
  UnsafeTransactionId,
  UnsafeLogId,
  UnsafeEmailAddress,
  UnsafeSlug,
} as const;