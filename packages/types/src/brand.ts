/**
 * Core branded type utilities for compile-time ID safety.
 * 
 * Branded types provide compile-time safety by creating distinct types
 * from the same underlying primitive, preventing ID mixups that cause
 * runtime errors in enterprise applications.
 */

/**
 * Core branding utility type.
 * 
 * Creates a branded type by intersecting the base type with a unique brand symbol.
 * The brand is phantom - it exists only at compile time for type safety.
 * 
 * @template T - The underlying type (usually string)
 * @template Brand - The brand identifier (unique string literal)
 */
export type Brand<T, Brand extends string> = T & {
  readonly __brand: Brand;
};

/**
 * Utility type to extract the underlying type from a branded type.
 * 
 * @template BrandedType - The branded type to unwrap
 */
export type Unbranded<BrandedType> = BrandedType extends Brand<infer T, string>
  ? T
  : BrandedType;

/**
 * Utility type to extract the brand from a branded type.
 * 
 * @template BrandedType - The branded type to extract brand from
 */
export type ExtractBrand<BrandedType> = BrandedType extends Brand<
  unknown,
  infer BrandName
>
  ? BrandName
  : never;

/**
 * Type predicate to check if a value is of a specific branded type.
 * Since brands are phantom, this is primarily for documentation and
 * type narrowing in generic contexts.
 * 
 * @template T - The underlying type
 * @template BrandName - The brand identifier
 */
export type IsBranded<T, BrandName extends string> = T extends Brand<unknown, BrandName>
  ? true
  : false;

/**
 * Error thrown when branded type validation fails.
 */
export class BrandValidationError extends Error {
  public readonly code = 'BRAND_VALIDATION_ERROR' as const;
  public readonly brandType: string;
  public readonly value: unknown;

  constructor(brandType: string, value: unknown, message?: string) {
    const defaultMessage = `Invalid value for ${brandType}: ${String(value)}`;
    super(message ?? defaultMessage);
    this.name = 'BrandValidationError';
    this.brandType = brandType;
    this.value = value;
  }
}

/**
 * Validation function type for branded type constructors.
 * 
 * @template T - The underlying type
 */
export type Validator<T> = (value: unknown) => value is T;

/**
 * Options for creating branded type constructors.
 * 
 * @template T - The underlying type
 */
export interface BrandConstructorOptions<T> {
  /** Human-readable name for the branded type (for error messages) */
  readonly name: string;
  /** Validation function to check if value is valid for this brand */
  readonly validate: Validator<T>;
  /** Optional custom error message function */
  readonly errorMessage?: (value: unknown) => string;
}

/**
 * Creates a constructor function for a branded type with runtime validation.
 * 
 * The constructor performs runtime validation while the brand provides
 * compile-time safety. This dual approach ensures both type safety and
 * runtime correctness.
 * 
 * @template T - The underlying type
 * @template BrandName - The brand identifier
 * @param options - Configuration for the branded type constructor
 * @returns Constructor function that creates branded values
 * 
 * @example
 * ```typescript
 * type UserId = Brand<string, 'UserId'>;
 * 
 * const UserId = createBrandConstructor<string, 'UserId'>({
 *   name: 'UserId',
 *   validate: (value): value is string => 
 *     typeof value === 'string' && isValidUuid(value)
 * });
 * 
 * const userId = UserId('550e8400-e29b-41d4-a716-446655440000');
 * // Type: UserId (branded)
 * // Runtime: validated UUID string
 * ```
 */
export function createBrandConstructor<T, BrandName extends string>(
  options: BrandConstructorOptions<T>
): (value: unknown) => Brand<T, BrandName> {
  return (value: unknown): Brand<T, BrandName> => {
    if (!options.validate(value)) {
      const message = options.errorMessage?.(value);
      throw new BrandValidationError(options.name, value, message);
    }
    
    return value as Brand<T, BrandName>;
  };
}

/**
 * Creates an unsafe constructor that skips validation.
 * 
 * USE WITH EXTREME CAUTION: Only use when you're certain the value
 * is valid and validation would be redundant (e.g., from database).
 * 
 * @template T - The underlying type
 * @template BrandName - The brand identifier
 * @returns Unsafe constructor function
 * 
 * @example
 * ```typescript
 * const UnsafeUserId = createUnsafeBrandConstructor<string, 'UserId'>();
 * const userId = UnsafeUserId('already-validated-uuid');
 * ```
 */
export function createUnsafeBrandConstructor<T, BrandName extends string>(): (
  value: T
) => Brand<T, BrandName> {
  return (value: T): Brand<T, BrandName> => value as Brand<T, BrandName>;
}

/**
 * Safely unwraps a branded type to its underlying value.
 * 
 * This is a no-op at runtime but provides explicit unwrapping
 * for better code readability and intent.
 * 
 * @template BrandedType - The branded type to unwrap
 * @param brandedValue - The branded value
 * @returns The underlying value
 * 
 * @example
 * ```typescript
 * const userId: UserId = UserId('550e8400-e29b-41d4-a716-446655440000');
 * const rawId: string = unwrap(userId);
 * ```
 */
export function unwrap<BrandedType>(
  brandedValue: BrandedType
): Unbranded<BrandedType> {
  return brandedValue as Unbranded<BrandedType>;
}

/**
 * Type-safe equality comparison for branded types.
 * 
 * Ensures both values are of the same branded type before comparison.
 * 
 * @template BrandedType - The branded type
 * @param a - First branded value
 * @param b - Second branded value
 * @returns True if underlying values are equal
 */
export function brandedEquals<BrandedType extends Brand<unknown, string>>(
  a: BrandedType,
  b: BrandedType
): boolean {
  return unwrap(a) === unwrap(b);
}

/**
 * Creates a comparator function for branded types.
 * 
 * @template BrandedType - The branded type
 * @param compareFn - Comparison function for underlying values
 * @returns Comparator function for branded values
 */
export function createBrandedComparator<
  BrandedType extends Brand<unknown, string>
>(
  compareFn: (a: Unbranded<BrandedType>, b: Unbranded<BrandedType>) => number
): (a: BrandedType, b: BrandedType) => number {
  return (a: BrandedType, b: BrandedType): number =>
    compareFn(unwrap(a), unwrap(b));
}