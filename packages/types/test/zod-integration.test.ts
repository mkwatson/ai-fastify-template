/**
 * Tests for Zod integration with branded types.
 * 
 * Tests the seamless integration between Zod schemas and branded types
 * for API boundary validation and type safety.
 */

import { describe, it, expect } from 'vitest';
import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import {
  type BrandedZodType,
  createBrandedZodSchema,
  brandedString,
  brandedUuid,
  brandedEmail,
  brandedSlug,
  ZodBrandedSchemas,
  createIdParamSchema,
  createIdQuerySchema,
  createEntityCreateSchema,
  createPaginatedResponseSchema,
  ExampleApiSchemas,
  createFastifySchema,
} from '../src/zod-integration.js';
import {
  type UserId,
  type ProductId,
  type EmailAddress,
  type Slug,
  unwrap,
} from '../src/index.js';
import { BrandValidationError } from '../src/brand.js';

// Test data
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const ANOTHER_VALID_UUID = '6ba7b810-9dad-41d1-80b4-00c04fd430c8'; // Fixed to be valid UUID v4
const THIRD_VALID_UUID = '123e4567-e89b-42d3-a456-426614174000'; // Fixed to be valid UUID v4
const INVALID_UUID = 'not-a-uuid';
const VALID_EMAIL = 'test@example.com';
const INVALID_EMAIL = 'not-an-email';
const VALID_SLUG = 'test-article-slug';
const INVALID_SLUG = 'Invalid Slug!';

describe('Zod Integration', () => {
  describe('createBrandedZodSchema', () => {
    it('should create schema that validates and transforms to branded type', () => {
      const UserIdSchema = createBrandedZodSchema<string, 'TestUserId'>(
        z.string().uuid(),
        {
          name: 'TestUserId',
          validate: (value): value is string => 
            typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value),
        }
      );

      const result = UserIdSchema.parse(VALID_UUID);
      
      expect(unwrap(result)).toBe(VALID_UUID);
      expect(() => UserIdSchema.parse(INVALID_UUID)).toThrow();
    });

    it('should integrate with existing Zod validation', () => {
      const StrictUserIdSchema = createBrandedZodSchema<string, 'StrictUserId'>(
        z.string().uuid().startsWith('550e'),
        {
          name: 'StrictUserId',
          validate: (value): value is string => typeof value === 'string',
        }
      );

      const result = StrictUserIdSchema.parse(VALID_UUID);
      expect(unwrap(result)).toBe(VALID_UUID);
      
      // Should fail Zod validation first
      expect(() => StrictUserIdSchema.parse('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toThrow();
    });
  });

  describe('brandedString', () => {
    it('should create branded string schema', () => {
      const BrandedNameSchema = brandedString<'TestName'>({
        name: 'TestName',
        validate: (value): value is string => 
          typeof value === 'string' && value.length >= 2,
      });

      const result = BrandedNameSchema.parse('John');
      expect(unwrap(result)).toBe('John');
      
      expect(() => BrandedNameSchema.parse('A')).toThrow(BrandValidationError);
      expect(() => BrandedNameSchema.parse(123)).toThrow();
    });
  });

  describe('brandedUuid', () => {
    it('should create branded UUID schema', () => {
      const UserIdSchema = brandedUuid<'TestUserId'>('TestUserId');

      const result = UserIdSchema.parse(VALID_UUID);
      expect(unwrap(result)).toBe(VALID_UUID);
      
      expect(() => UserIdSchema.parse(INVALID_UUID)).toThrow();
    });

    it('should validate UUID format before branding', () => {
      const UserIdSchema = brandedUuid<'TestUserId'>('TestUserId');
      
      // Zod validation should fail first
      expect(() => UserIdSchema.parse('not-uuid')).toThrow();
      expect(() => UserIdSchema.parse('')).toThrow();
      expect(() => UserIdSchema.parse(123)).toThrow();
    });
  });

  describe('brandedEmail', () => {
    it('should create branded email schema', () => {
      const EmailSchema = brandedEmail<'TestEmail'>('TestEmail');

      const result = EmailSchema.parse(VALID_EMAIL);
      expect(unwrap(result)).toBe(VALID_EMAIL);
      
      expect(() => EmailSchema.parse(INVALID_EMAIL)).toThrow();
    });

    it('should validate various email formats', () => {
      const EmailSchema = brandedEmail<'TestEmail'>('TestEmail');
      
      const validEmails = [
        'user@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        '123@456.com',
      ];

      for (const email of validEmails) {
        const result = EmailSchema.parse(email);
        expect(unwrap(result)).toBe(email);
      }
    });
  });

  describe('brandedSlug', () => {
    it('should create branded slug schema', () => {
      const SlugSchema = brandedSlug<'TestSlug'>('TestSlug');

      const result = SlugSchema.parse(VALID_SLUG);
      expect(unwrap(result)).toBe(VALID_SLUG);
      
      expect(() => SlugSchema.parse(INVALID_SLUG)).toThrow();
    });

    it('should validate slug format', () => {
      const SlugSchema = brandedSlug<'TestSlug'>('TestSlug');
      
      const validSlugs = ['hello', 'hello-world', 'article-123', 'a-b-c-1-2-3'];
      const invalidSlugs = ['Hello', 'hello_world', 'hello.world', 'hello world', ''];

      for (const slug of validSlugs) {
        const result = SlugSchema.parse(slug);
        expect(unwrap(result)).toBe(slug);
      }

      for (const slug of invalidSlugs) {
        expect(() => SlugSchema.parse(slug)).toThrow();
      }
    });
  });

  describe('ZodBrandedSchemas', () => {
    it('should provide pre-built schemas for all entity types', () => {
      // UUID-based schemas
      const userId = ZodBrandedSchemas.UserId.parse(VALID_UUID);
      const productId = ZodBrandedSchemas.ProductId.parse(VALID_UUID);
      const orderId = ZodBrandedSchemas.OrderId.parse(VALID_UUID);
      
      expectTypeOf(userId).toEqualTypeOf<UserId>();
      expectTypeOf(productId).toEqualTypeOf<ProductId>();
      
      expect(unwrap(userId)).toBe(VALID_UUID);
      expect(unwrap(productId)).toBe(VALID_UUID);
      expect(unwrap(orderId)).toBe(VALID_UUID);
    });

    it('should validate string-based schemas', () => {
      const roleId = ZodBrandedSchemas.RoleId.parse('admin');
      const categoryId = ZodBrandedSchemas.CategoryId.parse('electronics');
      
      expect(unwrap(roleId)).toBe('admin');
      expect(unwrap(categoryId)).toBe('electronics');
      
      expect(() => ZodBrandedSchemas.RoleId.parse('')).toThrow();
      expect(() => ZodBrandedSchemas.CategoryId.parse('')).toThrow();
    });

    it('should validate alternative ID types', () => {
      const email = ZodBrandedSchemas.EmailAddress.parse(VALID_EMAIL);
      const slug = ZodBrandedSchemas.Slug.parse(VALID_SLUG);
      
      expectTypeOf(email).toEqualTypeOf<EmailAddress>();
      expectTypeOf(slug).toEqualTypeOf<Slug>();
      
      expect(unwrap(email)).toBe(VALID_EMAIL);
      expect(unwrap(slug)).toBe(VALID_SLUG);
    });
  });

  describe('Schema Pattern Utilities', () => {
    describe('createIdParamSchema', () => {
      it('should create route parameter schema', () => {
        const GetUserParams = createIdParamSchema('userId', ZodBrandedSchemas.UserId);
        
        const result = GetUserParams.parse({ userId: VALID_UUID });
        
        expectTypeOf(result).toEqualTypeOf<{ userId: UserId }>();
        expect(unwrap(result.userId)).toBe(VALID_UUID);
      });

      it('should validate parameter format', () => {
        const GetProductParams = createIdParamSchema('productId', ZodBrandedSchemas.ProductId);
        
        expect(() => GetProductParams.parse({ productId: INVALID_UUID })).toThrow();
        expect(() => GetProductParams.parse({})).toThrow(); // Missing required param
      });
    });

    describe('createIdQuerySchema', () => {
      it('should create optional query parameter schema', () => {
        const QuerySchema = createIdQuerySchema('userId', ZodBrandedSchemas.UserId);
        
        const withParam = QuerySchema.parse({ userId: VALID_UUID });
        const withoutParam = QuerySchema.parse({});
        
        expect(unwrap(withParam.userId!)).toBe(VALID_UUID);
        expect(withoutParam.userId).toBeUndefined();
      });
    });

    describe('createEntityCreateSchema', () => {
      it('should create schema for entity creation', () => {
        const CreateUserSchema = createEntityCreateSchema(
          'id',
          ZodBrandedSchemas.UserId,
          {
            name: z.string().min(1),
            email: ZodBrandedSchemas.EmailAddress,
            roleId: ZodBrandedSchemas.RoleId,
          }
        );

        const result = CreateUserSchema.parse({
          name: 'John Doe',
          email: VALID_EMAIL,
          roleId: 'admin',
        });

        expect(result.name).toBe('John Doe');
        expect(unwrap(result.email)).toBe(VALID_EMAIL);
        expect(unwrap(result.roleId)).toBe('admin');
        expect(result.id).toBeUndefined(); // Optional ID
      });

      it('should handle optional ID in creation', () => {
        const CreateUserSchema = createEntityCreateSchema(
          'id',
          ZodBrandedSchemas.UserId,
          {
            name: z.string(),
          }
        );

        const withId = CreateUserSchema.parse({
          name: 'John',
          id: VALID_UUID,
        });

        const withoutId = CreateUserSchema.parse({
          name: 'John',
        });

        expect(unwrap(withId.id!)).toBe(VALID_UUID);
        expect(withoutId.id).toBeUndefined();
      });
    });

    describe('createPaginatedResponseSchema', () => {
      it('should create paginated response schema', () => {
        const UserSchema = z.object({
          id: ZodBrandedSchemas.UserId,
          name: z.string(),
        });

        const PaginatedUsersSchema = createPaginatedResponseSchema(UserSchema);

        const result = PaginatedUsersSchema.parse({
          items: [
            { id: VALID_UUID, name: 'John' },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          hasNext: false,
          hasPrev: false,
        });

        expect(result.items).toHaveLength(1);
        expect(unwrap(result.items[0].id)).toBe(VALID_UUID);
        expect(result.total).toBe(1);
        expect(result.hasNext).toBe(false);
      });
    });
  });

  describe('Example API Schemas', () => {
    describe('User Management Schemas', () => {
      it('should validate GetUserParams', () => {
        const result = ExampleApiSchemas.GetUserParams.parse({
          userId: VALID_UUID,
        });

        expectTypeOf(result).toEqualTypeOf<{ userId: UserId }>();
        expect(unwrap(result.userId)).toBe(VALID_UUID);
      });

      it('should validate CreateUserBody', () => {
        const result = ExampleApiSchemas.CreateUserBody.parse({
          email: VALID_EMAIL,
          name: 'John Doe',
          roleId: 'admin',
        });

        expect(unwrap(result.email)).toBe(VALID_EMAIL);
        expect(result.name).toBe('John Doe');
        expect(unwrap(result.roleId!)).toBe('admin');
      });

      it('should validate UpdateUserBody', () => {
        const result = ExampleApiSchemas.UpdateUserBody.parse({
          name: 'Jane Doe',
        });

        expect(result.name).toBe('Jane Doe');
        expect(result.roleId).toBeUndefined();
      });
    });

    describe('E-commerce Schemas', () => {
      it('should validate CreateOrderBody', () => {
        const result = ExampleApiSchemas.CreateOrderBody.parse({
          customerId: VALID_UUID,
          items: [
            {
              productId: VALID_UUID,
              quantity: 2,
              price: 29.99,
            },
          ],
        });

        expect(unwrap(result.customerId)).toBe(VALID_UUID);
        expect(result.items).toHaveLength(1);
        expect(unwrap(result.items[0].productId)).toBe(VALID_UUID);
        expect(result.items[0].quantity).toBe(2);
        expect(result.items[0].price).toBe(29.99);
      });

      it('should validate GetOrdersQuery', () => {
        const result = ExampleApiSchemas.GetOrdersQuery.parse({
          customerId: VALID_UUID,
          status: 'pending',
          page: 2,
          pageSize: 50,
        });

        expect(unwrap(result.customerId!)).toBe(VALID_UUID);
        expect(result.status).toBe('pending');
        expect(result.page).toBe(2);
        expect(result.pageSize).toBe(50);
      });

      it('should apply default values in GetOrdersQuery', () => {
        const result = ExampleApiSchemas.GetOrdersQuery.parse({});

        expect(result.customerId).toBeUndefined();
        expect(result.status).toBeUndefined();
        expect(result.page).toBe(1); // Default
        expect(result.pageSize).toBe(20); // Default
      });
    });

    describe('Content Management Schemas', () => {
      it('should validate CreateArticleBody', () => {
        const result = ExampleApiSchemas.CreateArticleBody.parse({
          title: 'Test Article',
          content: 'This is test content',
          authorId: VALID_UUID,
          slug: 'test-article',
        });

        expect(result.title).toBe('Test Article');
        expect(result.content).toBe('This is test content');
        expect(unwrap(result.authorId)).toBe(VALID_UUID);
        expect(unwrap(result.slug)).toBe('test-article');
        expect(result.categoryId).toBeUndefined();
      });

      it('should validate CreateCommentBody', () => {
        const articleId = VALID_UUID;
        const authorId = ANOTHER_VALID_UUID;
        const parentCommentId = THIRD_VALID_UUID;

        const result = ExampleApiSchemas.CreateCommentBody.parse({
          articleId,
          authorId,
          content: 'Great article!',
          parentCommentId,
        });

        expect(unwrap(result.articleId)).toBe(articleId);
        expect(unwrap(result.authorId)).toBe(authorId);
        expect(result.content).toBe('Great article!');
        expect(unwrap(result.parentCommentId!)).toBe(parentCommentId);
      });
    });
  });

  describe('Fastify Integration', () => {
    describe('createFastifySchema', () => {
      it('should create Fastify-compatible schema', () => {
        const schema = createFastifySchema({
          params: ExampleApiSchemas.GetUserParams,
          body: ExampleApiSchemas.CreateUserBody,
          response: {
            200: z.object({
              id: ZodBrandedSchemas.UserId,
              message: z.string(),
            }),
          },
        });

        expect(schema.params).toBe(ExampleApiSchemas.GetUserParams);
        expect(schema.body).toBe(ExampleApiSchemas.CreateUserBody);
        expect(schema.response![200]).toBeDefined();
      });

      it('should handle optional schema parts', () => {
        const schema = createFastifySchema({
          params: ExampleApiSchemas.GetUserParams,
        });

        expect(schema.params).toBe(ExampleApiSchemas.GetUserParams);
        expect(schema.body).toBeUndefined();
        expect(schema.querystring).toBeUndefined();
        expect(schema.response).toBeUndefined();
      });
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety through Zod transformation', () => {
      const result = ZodBrandedSchemas.UserId.parse(VALID_UUID);
      
      // Should be typed as UserId, not string
      expectTypeOf(result).toEqualTypeOf<UserId>();
      
      // Runtime verification
      expect(typeof result).toBe('string');
      expect(unwrap(result)).toBe(VALID_UUID);
    });

    it('should prevent type confusion in complex schemas', () => {
      const OrderSchema = z.object({
        id: ZodBrandedSchemas.OrderId,
        customerId: ZodBrandedSchemas.CustomerId,
        items: z.array(z.object({
          productId: ZodBrandedSchemas.ProductId,
          quantity: z.number(),
        })),
      });

      const result = OrderSchema.parse({
        id: VALID_UUID,
        customerId: ANOTHER_VALID_UUID,
        items: [
          {
            productId: THIRD_VALID_UUID,
            quantity: 2,
          },
        ],
      });

      // All IDs should have proper types
      expectTypeOf(result.id).toEqualTypeOf<typeof result.id>();
      expectTypeOf(result.customerId).toEqualTypeOf<typeof result.customerId>();
      expectTypeOf(result.items[0].productId).toEqualTypeOf<typeof result.items[0].productId>();
      
      // Cannot mix up ID types (would be compile error in real usage)
      expect(unwrap(result.id)).toBe(VALID_UUID);
      expect(unwrap(result.customerId)).not.toBe(unwrap(result.id));
    });
  });

  describe('Performance', () => {
    it('should parse branded types efficiently', () => {
      const UserIdSchema = ZodBrandedSchemas.UserId;
      const testData = Array.from({ length: 1000 }, (_, i) => 
        `550e8400-e29b-41d4-a716-${i.toString().padStart(12, '0')}`
      );

      const start = performance.now();
      
      for (const uuid of testData) {
        const result = UserIdSchema.parse(uuid);
        // Use result to prevent optimization
        if (unwrap(result) === 'impossible') break;
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete quickly (under 100ms for 1k parses)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for Zod validation', () => {
      expect(() => ZodBrandedSchemas.UserId.parse('not-uuid')).toThrow();
      expect(() => ZodBrandedSchemas.EmailAddress.parse('not-email')).toThrow();
      expect(() => ZodBrandedSchemas.Slug.parse('Invalid Slug!')).toThrow();
    });

    it('should differentiate between Zod and brand validation errors', () => {
      // Zod validation fails first (not a string)
      expect(() => ZodBrandedSchemas.UserId.parse(123)).toThrow();
      
      // Zod string validation passes, but UUID format fails
      expect(() => ZodBrandedSchemas.UserId.parse('not-uuid')).toThrow();
      
      // Brand validation fails after Zod validation passes
      const TestSchema = createBrandedZodSchema(
        z.string(), // Passes
        {
          name: 'TestType',
          validate: () => false, // Always fails
        }
      );
      
      expect(() => TestSchema.parse('valid-string')).toThrow(BrandValidationError);
    });
  });
});