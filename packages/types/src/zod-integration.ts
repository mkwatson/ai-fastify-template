/**
 * Zod integration for branded types.
 *
 * Provides seamless integration between branded types and Zod schemas
 * for API boundary validation. This ensures type safety from request
 * parsing to business logic execution.
 */

import { z } from 'zod';
import {
  type Brand,
  type BrandConstructorOptions,
  createBrandConstructor,
} from './brand.js';
import {
  type UserId,
  type SessionId,
  type RoleId,
  type ProductId,
  type OrderId,
  type CustomerId,
  type CategoryId,
  type ArticleId,
  type CommentId,
  type AuthorId,
  type RequestId,
  type TransactionId,
  type LogId,
  type EmailAddress,
  type Slug,
} from './entity-ids.js';
import {
  isValidUuid,
  isValidEmail,
  isNonEmptyString,
  ValidationErrors,
} from './validators.js';

/**
 * Branded Zod type that combines Zod schema with branded type construction.
 */
export type BrandedZodType<T, BrandName extends string> = z.ZodType<
  Brand<T, BrandName>,
  z.ZodTypeDef,
  unknown
>;

/**
 * Creates a Zod schema that validates and transforms to a branded type.
 *
 * @template T - The underlying type
 * @template BrandName - The brand identifier
 * @param baseSchema - Base Zod schema for the underlying type
 * @param options - Branded type constructor options
 * @returns Zod schema that produces branded values
 *
 * @example
 * ```typescript
 * const UserIdSchema = createBrandedZodSchema(
 *   z.string().uuid(),
 *   {
 *     name: 'UserId',
 *     validate: isValidUuid,
 *     errorMessage: ValidationErrors.INVALID_UUID,
 *   }
 * );
 *
 * // Usage in API routes
 * const CreateUserSchema = z.object({
 *   id: UserIdSchema,
 *   email: z.string().email(),
 * });
 * ```
 */
export function createBrandedZodSchema<T, BrandName extends string>(
  baseSchema: z.ZodType<T>,
  options: BrandConstructorOptions<T>
): BrandedZodType<T, BrandName> {
  const constructor = createBrandConstructor<T, BrandName>(options);

  return baseSchema.transform((value: T) => constructor(value));
}

/**
 * Creates a branded string schema with custom validation.
 */
export function brandedString<BrandName extends string>(
  options: BrandConstructorOptions<string>
): BrandedZodType<string, BrandName> {
  return createBrandedZodSchema(z.string(), options);
}

/**
 * Creates a branded UUID schema.
 */
export function brandedUuid<BrandName extends string>(
  brandName: string
): BrandedZodType<string, BrandName> {
  return createBrandedZodSchema(z.string().uuid(), {
    name: brandName,
    validate: isValidUuid,
    errorMessage: ValidationErrors.INVALID_UUID,
  });
}

/**
 * Creates a branded email schema.
 */
export function brandedEmail<BrandName extends string>(
  brandName: string
): BrandedZodType<string, BrandName> {
  return createBrandedZodSchema(z.string().email(), {
    name: brandName,
    validate: isValidEmail,
    errorMessage: ValidationErrors.INVALID_EMAIL,
  });
}

/**
 * Creates a branded slug schema.
 */
export function brandedSlug<BrandName extends string>(
  brandName: string
): BrandedZodType<string, BrandName> {
  const slugRegex = /^[a-z0-9-]+$/;
  const isValidSlug = (value: unknown): value is string =>
    typeof value === 'string' && slugRegex.test(value) && value.length > 0;

  return createBrandedZodSchema(
    z.string().regex(slugRegex, 'Invalid slug format'),
    {
      name: brandName,
      validate: isValidSlug,
      errorMessage: (value: unknown) =>
        `Invalid slug format: ${String(value)}. Must contain only lowercase letters, numbers, and hyphens.`,
    }
  );
}

// ============================================================================
// Pre-built Zod Schemas for Common Entity IDs
// ============================================================================

/**
 * Pre-built Zod schemas for all common entity ID types.
 * Ready to use in API route validation.
 */
export const ZodBrandedSchemas = {
  // User Management Domain
  UserId: brandedUuid<'UserId'>('UserId') as z.ZodType<UserId>,
  SessionId: brandedUuid<'SessionId'>('SessionId') as z.ZodType<SessionId>,
  RoleId: brandedString<'RoleId'>({
    name: 'RoleId',
    validate: isNonEmptyString,
    errorMessage: ValidationErrors.EMPTY_STRING,
  }) as z.ZodType<RoleId>,

  // E-commerce Domain
  ProductId: brandedUuid<'ProductId'>('ProductId') as z.ZodType<ProductId>,
  OrderId: brandedUuid<'OrderId'>('OrderId') as z.ZodType<OrderId>,
  CustomerId: brandedUuid<'CustomerId'>('CustomerId') as z.ZodType<CustomerId>,
  CategoryId: brandedString<'CategoryId'>({
    name: 'CategoryId',
    validate: isNonEmptyString,
    errorMessage: ValidationErrors.EMPTY_STRING,
  }) as z.ZodType<CategoryId>,

  // Content Management Domain
  ArticleId: brandedUuid<'ArticleId'>('ArticleId') as z.ZodType<ArticleId>,
  CommentId: brandedUuid<'CommentId'>('CommentId') as z.ZodType<CommentId>,
  AuthorId: brandedUuid<'AuthorId'>('AuthorId') as z.ZodType<AuthorId>,

  // System Resource Domain
  RequestId: brandedUuid<'RequestId'>('RequestId') as z.ZodType<RequestId>,
  TransactionId: brandedUuid<'TransactionId'>(
    'TransactionId'
  ) as z.ZodType<TransactionId>,
  LogId: brandedUuid<'LogId'>('LogId') as z.ZodType<LogId>,

  // Alternative ID Types
  EmailAddress: brandedEmail<'EmailAddress'>(
    'EmailAddress'
  ) as z.ZodType<EmailAddress>,
  Slug: brandedSlug<'Slug'>('Slug') as z.ZodType<Slug>,
} as const;

// ============================================================================
// Common Schema Patterns
// ============================================================================

/**
 * Schema for route parameters with a single ID.
 *
 * @example
 * ```typescript
 * const GetUserParams = createIdParamSchema('userId', ZodBrandedSchemas.UserId);
 * // Results in: { userId: UserId }
 * ```
 */
export function createIdParamSchema<T>(
  paramName: string,
  idSchema: z.ZodType<T>
): z.ZodObject<Record<string, z.ZodType<T>>> {
  return z.object({
    [paramName]: idSchema,
  } as Record<string, z.ZodType<T>>);
}

/**
 * Schema for query parameters with optional ID filters.
 */
export function createIdQuerySchema<T>(
  paramName: string,
  idSchema: z.ZodType<T>
): z.ZodObject<Record<string, z.ZodOptional<z.ZodType<T>>>> {
  return z.object({
    [paramName]: idSchema.optional(),
  } as Record<string, z.ZodOptional<z.ZodType<T>>>);
}

/**
 * Schema for request bodies that create entities with references.
 * Simplified version to avoid complex type inference issues.
 */
export function createEntityCreateSchema<TEntityId>(
  entityIdName: string,
  entityIdSchema: z.ZodType<TEntityId>,
  additionalFields: z.ZodRawShape
): z.ZodObject<z.ZodRawShape> {
  const schemaWithOptionalId = {
    ...additionalFields,
    [entityIdName]: entityIdSchema.optional(),
  };

  return z.object(schemaWithOptionalId);
}

/**
 * Schema for paginated list responses with typed IDs.
 */
export function createPaginatedResponseSchema<T>(
  itemSchema: z.ZodType<T>
): z.ZodObject<{
  items: z.ZodArray<z.ZodType<T>>;
  total: z.ZodNumber;
  page: z.ZodNumber;
  pageSize: z.ZodNumber;
  hasNext: z.ZodBoolean;
  hasPrev: z.ZodBoolean;
}> {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  });
}

// ============================================================================
// Common API Schema Examples
// ============================================================================

/**
 * Example schemas for common API patterns using branded types.
 * These serve as templates for actual API implementation.
 */
export const ExampleApiSchemas = {
  // User Management
  GetUserParams: createIdParamSchema('userId', ZodBrandedSchemas.UserId),
  CreateUserBody: z.object({
    email: ZodBrandedSchemas.EmailAddress,
    name: z.string().min(1).max(100),
    roleId: ZodBrandedSchemas.RoleId.optional(),
  }),
  UpdateUserBody: z.object({
    name: z.string().min(1).max(100).optional(),
    roleId: ZodBrandedSchemas.RoleId.optional(),
  }),

  // E-commerce
  GetProductParams: createIdParamSchema(
    'productId',
    ZodBrandedSchemas.ProductId
  ),
  CreateOrderBody: z.object({
    customerId: ZodBrandedSchemas.CustomerId,
    items: z.array(
      z.object({
        productId: ZodBrandedSchemas.ProductId,
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    ),
  }),
  GetOrdersQuery: z.object({
    customerId: ZodBrandedSchemas.CustomerId.optional(),
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered']).optional(),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(20),
  }),

  // Content Management
  CreateArticleBody: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    authorId: ZodBrandedSchemas.AuthorId,
    categoryId: ZodBrandedSchemas.CategoryId.optional(),
    slug: ZodBrandedSchemas.Slug,
  }),
  CreateCommentBody: z.object({
    articleId: ZodBrandedSchemas.ArticleId,
    authorId: ZodBrandedSchemas.AuthorId,
    content: z.string().min(1).max(1000),
    parentCommentId: ZodBrandedSchemas.CommentId.optional(),
  }),
} as const;

// ============================================================================
// Utilities for Fastify Integration
// ============================================================================

/**
 * Helper to create Fastify route schema with branded types.
 * Provides proper typing for request handlers.
 */
export function createFastifySchema<
  TParams = unknown,
  TQuerystring = unknown,
  TBody = unknown,
  TResponse = unknown,
>(schema: {
  params?: z.ZodType<TParams>;
  querystring?: z.ZodType<TQuerystring>;
  body?: z.ZodType<TBody>;
  response?: Record<number, z.ZodType<TResponse>>;
}): {
  params?: z.ZodType<TParams>;
  querystring?: z.ZodType<TQuerystring>;
  body?: z.ZodType<TBody>;
  response?: Record<number, z.ZodType<TResponse>>;
} {
  return {
    ...(schema.params && { params: schema.params }),
    ...(schema.querystring && { querystring: schema.querystring }),
    ...(schema.body && { body: schema.body }),
    ...(schema.response && { response: schema.response }),
  };
}

/**
 * Type-safe request handler type for Fastify with branded types.
 */
export type BrandedFastifyHandler<
  TParams = unknown,
  TQuerystring = unknown,
  TBody = unknown,
  TResponse = unknown,
> = (
  request: {
    params: TParams;
    query: TQuerystring;
    body: TBody;
  },
  reply: {
    code: (statusCode: number) => { send: (payload: TResponse) => void };
    send: (payload: TResponse) => void;
  }
) => Promise<TResponse | void>;

/**
 * Example of type-safe Fastify route with branded types.
 * This demonstrates the complete integration pattern.
 */
export const ExampleTypeSafeRoute = {
  schema: createFastifySchema({
    params: ExampleApiSchemas.GetUserParams,
    response: {
      200: z.object({
        id: ZodBrandedSchemas.UserId,
        email: ZodBrandedSchemas.EmailAddress,
        name: z.string(),
        roleId: ZodBrandedSchemas.RoleId.optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    },
  }),
  // Simplified handler without complex type assertions
  handler: async (
    request: { params: { userId: UserId } },
    reply: { code: (status: number) => { send: (data: unknown) => void } }
  ) => {
    // request.params.userId is typed as UserId through schema validation
    const { userId } = request.params;

    // Business logic here...
    // The userId is guaranteed to be a valid branded UserId

    // Note: In real implementation, you would construct branded types properly
    return reply.code(200).send({
      id: userId,
      email: 'user@example.com' as unknown as EmailAddress, // Would be EmailAddress in real implementation
      name: 'John Doe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
} as const;
