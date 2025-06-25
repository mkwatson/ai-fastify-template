/**
 * Tests for entity ID branded types.
 * 
 * Tests all entity ID constructors, validation, and type safety
 * to ensure proper compile-time and runtime behavior.
 */

import { describe, it, expect } from 'vitest';
import { expectType } from 'expect-type';
import {
  // User Management Domain
  type UserId,
  UserId,
  UnsafeUserId,
  type SessionId,
  SessionId,
  UnsafeSessionId,
  type RoleId,
  RoleId,
  UnsafeRoleId,
  
  // E-commerce Domain
  type ProductId,
  ProductId,
  UnsafeProductId,
  type OrderId,
  OrderId,
  UnsafeOrderId,
  type CustomerId,
  CustomerId,
  UnsafeCustomerId,
  type CategoryId,
  CategoryId,
  UnsafeCategoryId,
  
  // Content Management Domain
  type ArticleId,
  ArticleId,
  UnsafeArticleId,
  type CommentId,
  CommentId,
  UnsafeCommentId,
  type AuthorId,
  AuthorId,
  UnsafeAuthorId,
  
  // System Resource Domain
  type RequestId,
  RequestId,
  UnsafeRequestId,
  type TransactionId,
  TransactionId,
  UnsafeTransactionId,
  type LogId,
  LogId,
  UnsafeLogId,
  
  // Alternative ID Types
  type EmailAddress,
  EmailAddress,
  UnsafeEmailAddress,
  type Slug,
  Slug,
  UnsafeSlug,
  
  // Utilities
  type AnyEntityId,
  isEntityId,
  EntityIdConstructors,
  UnsafeEntityIdConstructors,
} from '../src/entity-ids.js';
import { BrandValidationError, unwrap } from '../src/brand.js';

// Test UUIDs
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const ANOTHER_VALID_UUID = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';
const INVALID_UUID = 'not-a-uuid';

describe('Entity ID Types', () => {
  describe('User Management Domain', () => {
    describe('UserId', () => {
      it('should create valid UserId from UUID', () => {
        const userId = UserId(VALID_UUID);
        
        expectType<UserId>(userId);
        expect(unwrap(userId)).toBe(VALID_UUID);
      });

      it('should reject invalid UUID for UserId', () => {
        expect(() => UserId(INVALID_UUID)).toThrow(BrandValidationError);
        expect(() => UserId('')).toThrow(BrandValidationError);
        expect(() => UserId('123')).toThrow(BrandValidationError);
      });

      it('should create unsafe UserId without validation', () => {
        const userId = UnsafeUserId(INVALID_UUID);
        
        expectType<UserId>(userId);
        expect(unwrap(userId)).toBe(INVALID_UUID);
      });
    });

    describe('SessionId', () => {
      it('should create valid SessionId from UUID', () => {
        const sessionId = SessionId(VALID_UUID);
        
        expectType<SessionId>(sessionId);
        expect(unwrap(sessionId)).toBe(VALID_UUID);
      });

      it('should be distinct from UserId at type level', () => {
        const userId = UserId(VALID_UUID);
        const sessionId = SessionId(ANOTHER_VALID_UUID);
        
        expectType<UserId>(userId);
        expectType<SessionId>(sessionId);
        
        // These would be compile errors in real code:
        // processUser(sessionId); // ❌ Type error
        // processSession(userId); // ❌ Type error
      });
    });

    describe('RoleId', () => {
      it('should create valid RoleId from non-empty string', () => {
        const roleId = RoleId('admin');
        
        expectType<RoleId>(roleId);
        expect(unwrap(roleId)).toBe('admin');
      });

      it('should reject empty string for RoleId', () => {
        expect(() => RoleId('')).toThrow(BrandValidationError);
      });

      it('should accept various role formats', () => {
        expect(unwrap(RoleId('admin'))).toBe('admin');
        expect(unwrap(RoleId('user-manager'))).toBe('user-manager');
        expect(unwrap(RoleId('SUPER_ADMIN'))).toBe('SUPER_ADMIN');
        expect(unwrap(RoleId('123'))).toBe('123');
      });
    });
  });

  describe('E-commerce Domain', () => {
    describe('ProductId', () => {
      it('should create valid ProductId from UUID', () => {
        const productId = ProductId(VALID_UUID);
        
        expectType<ProductId>(productId);
        expect(unwrap(productId)).toBe(VALID_UUID);
      });

      it('should be distinct from other entity IDs', () => {
        const productId = ProductId(VALID_UUID);
        const orderId = OrderId(ANOTHER_VALID_UUID);
        
        expectType<ProductId>(productId);
        expectType<OrderId>(orderId);
        
        expect(unwrap(productId)).not.toBe(unwrap(orderId));
      });
    });

    describe('OrderId', () => {
      it('should create valid OrderId from UUID', () => {
        const orderId = OrderId(VALID_UUID);
        
        expectType<OrderId>(orderId);
        expect(unwrap(orderId)).toBe(VALID_UUID);
      });
    });

    describe('CustomerId', () => {
      it('should create valid CustomerId from UUID', () => {
        const customerId = CustomerId(VALID_UUID);
        
        expectType<CustomerId>(customerId);
        expect(unwrap(customerId)).toBe(VALID_UUID);
      });
    });

    describe('CategoryId', () => {
      it('should create valid CategoryId from non-empty string', () => {
        const categoryId = CategoryId('electronics');
        
        expectType<CategoryId>(categoryId);
        expect(unwrap(categoryId)).toBe('electronics');
      });

      it('should accept various category formats', () => {
        expect(unwrap(CategoryId('electronics'))).toBe('electronics');
        expect(unwrap(CategoryId('home-garden'))).toBe('home-garden');
        expect(unwrap(CategoryId('BOOKS_MEDIA'))).toBe('BOOKS_MEDIA');
      });
    });
  });

  describe('Content Management Domain', () => {
    describe('ArticleId', () => {
      it('should create valid ArticleId from UUID', () => {
        const articleId = ArticleId(VALID_UUID);
        
        expectType<ArticleId>(articleId);
        expect(unwrap(articleId)).toBe(VALID_UUID);
      });
    });

    describe('CommentId', () => {
      it('should create valid CommentId from UUID', () => {
        const commentId = CommentId(VALID_UUID);
        
        expectType<CommentId>(commentId);
        expect(unwrap(commentId)).toBe(VALID_UUID);
      });
    });

    describe('AuthorId', () => {
      it('should create valid AuthorId from UUID', () => {
        const authorId = AuthorId(VALID_UUID);
        
        expectType<AuthorId>(authorId);
        expect(unwrap(authorId)).toBe(VALID_UUID);
      });
    });
  });

  describe('System Resource Domain', () => {
    describe('RequestId', () => {
      it('should create valid RequestId from UUID', () => {
        const requestId = RequestId(VALID_UUID);
        
        expectType<RequestId>(requestId);
        expect(unwrap(requestId)).toBe(VALID_UUID);
      });
    });

    describe('TransactionId', () => {
      it('should create valid TransactionId from UUID', () => {
        const transactionId = TransactionId(VALID_UUID);
        
        expectType<TransactionId>(transactionId);
        expect(unwrap(transactionId)).toBe(VALID_UUID);
      });
    });

    describe('LogId', () => {
      it('should create valid LogId from UUID', () => {
        const logId = LogId(VALID_UUID);
        
        expectType<LogId>(logId);
        expect(unwrap(logId)).toBe(VALID_UUID);
      });
    });
  });

  describe('Alternative ID Types', () => {
    describe('EmailAddress', () => {
      it('should create valid EmailAddress from email string', () => {
        const email = EmailAddress('user@example.com');
        
        expectType<EmailAddress>(email);
        expect(unwrap(email)).toBe('user@example.com');
      });

      it('should validate email format', () => {
        expect(unwrap(EmailAddress('test@example.com'))).toBe('test@example.com');
        expect(unwrap(EmailAddress('user.name@domain.co.uk'))).toBe('user.name@domain.co.uk');
        expect(unwrap(EmailAddress('test+tag@example.org'))).toBe('test+tag@example.org');
      });

      it('should reject invalid email formats', () => {
        expect(() => EmailAddress('not-an-email')).toThrow(BrandValidationError);
        expect(() => EmailAddress('test@')).toThrow(BrandValidationError);
        expect(() => EmailAddress('@example.com')).toThrow(BrandValidationError);
      });
    });

    describe('Slug', () => {
      it('should create valid Slug from slug string', () => {
        const slug = Slug('my-article-slug');
        
        expectType<Slug>(slug);
        expect(unwrap(slug)).toBe('my-article-slug');
      });

      it('should validate slug format', () => {
        expect(unwrap(Slug('hello'))).toBe('hello');
        expect(unwrap(Slug('hello-world'))).toBe('hello-world');
        expect(unwrap(Slug('article-123'))).toBe('article-123');
        expect(unwrap(Slug('a-b-c-1-2-3'))).toBe('a-b-c-1-2-3');
      });

      it('should reject invalid slug formats', () => {
        expect(() => Slug('Hello World')).toThrow(BrandValidationError); // Uppercase/spaces
        expect(() => Slug('hello_world')).toThrow(BrandValidationError); // Underscore
        expect(() => Slug('hello.world')).toThrow(BrandValidationError); // Dot
        expect(() => Slug('')).toThrow(BrandValidationError); // Empty
      });
    });
  });

  describe('Unsafe Constructors', () => {
    it('should create all entity types without validation', () => {
      const invalidValue = 'definitely-not-valid';
      
      // UUID-based IDs with invalid values
      expect(unwrap(UnsafeUserId(invalidValue))).toBe(invalidValue);
      expect(unwrap(UnsafeProductId(invalidValue))).toBe(invalidValue);
      expect(unwrap(UnsafeOrderId(invalidValue))).toBe(invalidValue);
      
      // String-based IDs with empty values
      expect(unwrap(UnsafeRoleId(''))).toBe('');
      expect(unwrap(UnsafeCategoryId(''))).toBe('');
      
      // Email with invalid format
      expect(unwrap(UnsafeEmailAddress('not-email'))).toBe('not-email');
      
      // Slug with invalid format
      expect(unwrap(UnsafeSlug('Invalid Slug!'))).toBe('Invalid Slug!');
    });

    it('should maintain type safety even without validation', () => {
      const unsafeUserId = UnsafeUserId('invalid');
      const unsafeOrderId = UnsafeOrderId('invalid');
      
      expectType<UserId>(unsafeUserId);
      expectType<OrderId>(unsafeOrderId);
      
      // Still type-safe at compile time
      expect(typeof unsafeUserId).toBe('string');
      expect(typeof unsafeOrderId).toBe('string');
    });
  });

  describe('Type Safety', () => {
    it('should prevent mixing different entity ID types', () => {
      const userId = UserId(VALID_UUID);
      const orderId = OrderId(ANOTHER_VALID_UUID);
      const productId = ProductId(VALID_UUID);
      
      // These are all different types at compile time
      expectType<UserId>(userId);
      expectType<OrderId>(orderId);
      expectType<ProductId>(productId);
      
      // But same runtime representation
      expect(typeof userId).toBe('string');
      expect(typeof orderId).toBe('string');
      expect(typeof productId).toBe('string');
    });

    it('should allow type-safe operations', () => {
      const userId1 = UserId(VALID_UUID);
      const userId2 = UserId(ANOTHER_VALID_UUID);
      const userId3 = UserId(VALID_UUID);
      
      // Can compare same types
      expect(unwrap(userId1)).not.toBe(unwrap(userId2));
      expect(unwrap(userId1)).toBe(unwrap(userId3));
    });
  });

  describe('Utilities', () => {
    describe('isEntityId', () => {
      it('should validate entity ID-like values', () => {
        expect(isEntityId('some-id')).toBe(true);
        expect(isEntityId(VALID_UUID)).toBe(true);
        expect(isEntityId('123')).toBe(true);
      });

      it('should reject non-entity-ID values', () => {
        expect(isEntityId('')).toBe(false);
        expect(isEntityId(123)).toBe(false);
        expect(isEntityId(null)).toBe(false);
        expect(isEntityId(undefined)).toBe(false);
      });
    });

    describe('EntityIdConstructors', () => {
      it('should contain all safe constructors', () => {
        expect(EntityIdConstructors.UserId).toBe(UserId);
        expect(EntityIdConstructors.ProductId).toBe(ProductId);
        expect(EntityIdConstructors.EmailAddress).toBe(EmailAddress);
        expect(EntityIdConstructors.Slug).toBe(Slug);
      });

      it('should create valid IDs using constructor references', () => {
        const userId = EntityIdConstructors.UserId(VALID_UUID);
        const email = EntityIdConstructors.EmailAddress('test@example.com');
        
        expectType<UserId>(userId);
        expectType<EmailAddress>(email);
      });
    });

    describe('UnsafeEntityIdConstructors', () => {
      it('should contain all unsafe constructors', () => {
        expect(UnsafeEntityIdConstructors.UnsafeUserId).toBe(UnsafeUserId);
        expect(UnsafeEntityIdConstructors.UnsafeProductId).toBe(UnsafeProductId);
        expect(UnsafeEntityIdConstructors.UnsafeEmailAddress).toBe(UnsafeEmailAddress);
        expect(UnsafeEntityIdConstructors.UnsafeSlug).toBe(UnsafeSlug);
      });
    });

    describe('AnyEntityId type', () => {
      it('should accept all entity ID types', () => {
        const userId = UserId(VALID_UUID);
        const productId = ProductId(VALID_UUID);
        const email = EmailAddress('test@example.com');
        const slug = Slug('test-slug');
        
        // All should be assignable to AnyEntityId
        const ids: AnyEntityId[] = [userId, productId, email, slug];
        
        expect(ids).toHaveLength(4);
        expect(ids.every(id => typeof id === 'string')).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should create entity IDs efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        const uuid = `550e8400-e29b-41d4-a716-${i.toString().padStart(12, '0')}`;
        const userId = UserId(uuid);
        const productId = ProductId(uuid);
        
        // Use the values to prevent optimization
        if (unwrap(userId) === 'impossible' || unwrap(productId) === 'impossible') {
          break;
        }
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete quickly (under 200ms for 20k operations)
      expect(duration).toBeLessThan(200);
    });

    it('should create unsafe entity IDs with minimal overhead', () => {
      const start = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        const value = `test-${i}`;
        const userId = UnsafeUserId(value);
        const productId = UnsafeProductId(value);
        
        // Use the values to prevent optimization
        if (unwrap(userId) === 'impossible' || unwrap(productId) === 'impossible') {
          break;
        }
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should be very fast (under 20ms for 20k operations)
      expect(duration).toBeLessThan(20);
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error information', () => {
      try {
        UserId('invalid-uuid');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BrandValidationError);
        
        if (error instanceof BrandValidationError) {
          expect(error.code).toBe('BRAND_VALIDATION_ERROR');
          expect(error.brandType).toBe('UserId');
          expect(error.value).toBe('invalid-uuid');
          expect(error.message).toContain('Invalid UUID format');
        }
      }
    });

    it('should provide specific error messages for different types', () => {
      const testCases = [
        { constructor: UserId, invalid: 'not-uuid', expectedMessage: 'Invalid UUID format' },
        { constructor: EmailAddress, invalid: 'not-email', expectedMessage: 'Invalid email format' },
        { constructor: Slug, invalid: 'Invalid Slug!', expectedMessage: 'Invalid slug format' },
        { constructor: RoleId, invalid: '', expectedMessage: 'String cannot be empty' },
      ];

      for (const { constructor, invalid, expectedMessage } of testCases) {
        try {
          constructor(invalid);
          expect.fail(`Should have thrown for ${constructor.name}`);
        } catch (error) {
          expect(error).toBeInstanceOf(BrandValidationError);
          if (error instanceof BrandValidationError) {
            expect(error.message).toContain(expectedMessage);
          }
        }
      }
    });
  });
});