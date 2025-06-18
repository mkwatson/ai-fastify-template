# AI Agent Guidelines

This document provides comprehensive guidance for AI coding assistants working with the AI Fastify Template codebase. These guidelines ensure maximum code quality and help AI agents produce enterprise-grade code that passes all quality gates on the first try.

## Quality-First Philosophy

This template is designed for **AI-assisted development at enterprise scale**. Every pattern, rule, and example is optimized to help AI coding assistants produce code that:
- ✅ Passes TypeScript strict mode compilation
- ✅ Meets all linting and formatting standards  
- ✅ Includes comprehensive test coverage
- ✅ Follows security best practices
- ✅ Maintains architectural boundaries
- ✅ Looks like it was written by expert engineers

## Table of Contents

- [Quality-First Philosophy](#quality-first-philosophy)
- [Core Principles](#core-principles)
- [Code Patterns](#code-patterns)
- [Architecture Rules](#architecture-rules)
- [Quality Standards](#quality-standards)
- [Enterprise Patterns](#enterprise-patterns)
- [Testing Excellence](#testing-excellence)
- [Security & Performance](#security--performance)
- [Troubleshooting](#troubleshooting)

## Core Principles

### 1. Type Safety First

Always use strict TypeScript with explicit types:

```typescript
// ✅ Good: Explicit types, clear interfaces
interface CreateUserRequest {
  email: string;
  name: string;
  role?: 'user' | 'admin';
}

function createUser(data: CreateUserRequest): Promise<User> {
  // Implementation
}

// ❌ Bad: Implicit any types
function createUser(data: any): any {
  // Implementation
}
```

### 2. Validation Everywhere

Use Zod for all runtime validation:

```typescript
// ✅ Good: Zod schema with type inference
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin']).optional(),
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// ❌ Bad: No validation
function createUser(data: { email: string; name: string }) {
  // Direct use without validation
}
```

### 3. Clean Architecture

Respect layer boundaries and dependency rules:

```typescript
// ✅ Good: Apps depend on packages
// apps/backend-api/src/routes/users.ts
import { UserService } from '@ai-fastify-template/user-service';

// ✅ Good: Packages depend on other packages
// packages/user-service/src/index.ts
import { DatabaseClient } from '@ai-fastify-template/database';

// ❌ Bad: Packages depending on apps
// packages/shared/src/utils.ts
import { something } from '../../../apps/backend-api/src/...';
```

## Code Patterns

### Fastify Route Handlers

```typescript
// ✅ Good: Complete route with validation and error handling
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const users: FastifyPluginAsync = async (fastify) => {
  fastify.post('/users', {
    schema: {
      body: CreateUserSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userData = CreateUserSchema.parse(request.body);
      const user = await fastify.userService.createUser(userData);
      
      reply.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      fastify.log.error({ error }, 'Failed to create user');
      throw error;
    }
  });
};

export default users;
```

### Service Layer

```typescript
// ✅ Good: Pure service with dependency injection
export interface UserService {
  createUser(data: CreateUserRequest): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export class UserServiceImpl implements UserService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly logger: Logger,
  ) {}

  async createUser(data: CreateUserRequest): Promise<User> {
    this.logger.info({ email: data.email }, 'Creating user');
    
    const user = await this.db.users.create({
      data: {
        email: data.email,
        name: data.name,
        createdAt: new Date(),
      },
    });

    return user;
  }
}
```

### Environment Configuration

```typescript
// ✅ Good: Zod-validated environment configuration
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(): Env {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment configuration:', error);
    process.exit(1);
  }
}
```

## Architecture Rules

### Package Structure

When creating new packages:

```bash
# ✅ Good: Proper package structure
packages/my-package/
├── src/
│   ├── index.ts          # Main exports
│   ├── types.ts          # Type definitions
│   └── lib/              # Implementation
├── test/                 # Tests
├── package.json          # Package config
└── README.md             # Package documentation
```

### Dependency Management

```json
// ✅ Good: Proper package.json for packages
{
  "name": "@ai-fastify-template/my-package",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "lint": "biome check .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Import/Export Patterns

```typescript
// ✅ Good: Explicit exports from index.ts
// packages/my-package/src/index.ts
export { UserService, type User } from './user-service';
export { validateUser } from './validation';
export type { CreateUserRequest, UpdateUserRequest } from './types';

// ✅ Good: Explicit imports
import { UserService, type User } from '@ai-fastify-template/user-service';

// ❌ Bad: Barrel exports that re-export everything
export * from './user-service';
export * from './validation';
```

## Quality Standards

### TypeScript Configuration

Always use strict TypeScript settings:

```json
// ✅ Good: Strict TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Error Handling

```typescript
// ✅ Good: Proper error handling with types
class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.name = 'UserNotFoundError';
  }
}

async function getUserById(id: string): Promise<User> {
  const user = await db.users.findById(id);
  
  if (!user) {
    throw new UserNotFoundError(id);
  }
  
  return user;
}

// ✅ Good: Error handling in routes
fastify.get('/users/:id', async (request, reply) => {
  try {
    const user = await getUserById(request.params.id);
    reply.send(user);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      reply.status(404).send({ error: 'User not found' });
    } else {
      fastify.log.error({ error }, 'Failed to get user');
      reply.status(500).send({ error: 'Internal server error' });
    }
  }
});
```

## Common Patterns

### Database Operations

```typescript
// ✅ Good: Repository pattern with proper typing
interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

class DatabaseUserRepository implements UserRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(data: CreateUserData): Promise<User> {
    return this.db.users.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.users.findUnique({ where: { id } });
  }
}
```

### Validation Schemas

```typescript
// ✅ Good: Reusable validation schemas
const BaseUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const CreateUserSchema = BaseUserSchema.extend({
  password: z.string().min(8),
});

const UpdateUserSchema = BaseUserSchema.partial();

const UserResponseSchema = BaseUserSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export types
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
```

### Plugin Registration

```typescript
// ✅ Good: Fastify plugin with proper typing
import fp from 'fastify-plugin';
import { UserService, UserServiceImpl } from './user-service';

declare module 'fastify' {
  interface FastifyInstance {
    userService: UserService;
  }
}

export default fp(async (fastify) => {
  const userService = new UserServiceImpl(
    fastify.db,
    fastify.log,
  );

  fastify.decorate('userService', userService);
}, {
  name: 'user-service',
  dependencies: ['database'],
});
```

## Error Handling

### HTTP Status Codes

Use appropriate HTTP status codes:

```typescript
// ✅ Good: Proper status codes
reply.status(200).send(data);        // OK
reply.status(201).send(created);     // Created
reply.status(204).send();            // No Content
reply.status(400).send(error);       // Bad Request
reply.status(401).send(error);       // Unauthorized
reply.status(403).send(error);       // Forbidden
reply.status(404).send(error);       // Not Found
reply.status(422).send(error);       // Unprocessable Entity
reply.status(500).send(error);       // Internal Server Error
```

### Error Response Format

```typescript
// ✅ Good: Consistent error response format
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

function createErrorResponse(
  error: string,
  message: string,
  statusCode: number,
): ErrorResponse {
  return {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}
```

## Testing Guidelines

### Unit Tests

```typescript
// ✅ Good: Comprehensive unit tests
import { describe, it, expect, beforeEach } from 'vitest';
import { UserServiceImpl } from '../user-service';
import { createMockDatabase, createMockLogger } from '../test-utils';

describe('UserService', () => {
  let userService: UserServiceImpl;
  let mockDb: ReturnType<typeof createMockDatabase>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockLogger = createMockLogger();
    userService = new UserServiceImpl(mockDb, mockLogger);
  });

  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const expectedUser = { id: '1', ...userData };
      mockDb.users.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockDb.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining(userData),
      });
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
      };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

### Integration Tests

```typescript
// ✅ Good: Integration tests for routes
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../test-helper';
import type { FastifyInstance } from 'fastify';

describe('User Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create user with valid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(201);
      const user = response.json();
      expect(user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should return 400 for invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          email: 'invalid-email',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
```

## Troubleshooting

### Common Issues and Solutions

**TypeScript Errors**
```bash
# Check for type errors (coming with MAR-11+)
# pnpm type-check

# Common fixes:
# 1. Add explicit return types
# 2. Use proper type assertions
# 3. Handle null/undefined cases
```

**Validation Errors**
```typescript
// ✅ Good: Handle Zod validation errors
try {
  const data = Schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation error
    const issues = error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    reply.status(400).send({ error: 'Validation failed', issues });
  }
}
```

**Dependency Issues**
```bash
# Check dependency graph
pnpm graph

# Fix circular dependencies by:
# 1. Moving shared code to packages
# 2. Using dependency injection
# 3. Restructuring imports
```

### When AI Gets Stuck

1. **Check the pipeline**: Run `pnpm lint && pnpm build` to see specific errors
2. **Focus on one error**: Fix one constraint violation at a time
3. **Reference existing patterns**: Look at similar implementations in the codebase
4. **Break down the request**: Make smaller, more focused changes

### Effective AI Prompts

```
✅ Good: "Add a new POST /users route that validates the request body with Zod, 
creates a user using the UserService, and returns a 201 response with the user data"

✅ Good: "Create a UserService interface and implementation that follows the 
repository pattern and includes proper error handling"

❌ Bad: "Add a user route" (too vague)
❌ Bad: "Make it work" (no specific guidance)
```

---

## Enterprise Patterns

### Advanced Error Handling with Context

```typescript
// ✅ Enterprise: Comprehensive error handling with tracing
export class UserService {
  async createUser(userData: CreateUserInput, context: RequestContext): Promise<User> {
    const correlationId = context.correlationId;
    
    try {
      this.logger.info({ 
        correlationId, 
        email: userData.email 
      }, 'Starting user creation');

      // Validate business rules
      await this.validateUserCreationRules(userData, correlationId);
      
      // Create user in transaction
      const user = await this.db.transaction(async (tx) => {
        const newUser = await tx.users.create({ data: userData });
        await this.auditService.logUserCreation(newUser.id, context);
        return newUser;
      });

      this.logger.info({ 
        correlationId, 
        userId: user.id 
      }, 'User created successfully');
      
      return user;
      
    } catch (error) {
      this.logger.error({ 
        correlationId, 
        error: error.message,
        stack: error.stack,
        userData: { email: userData.email } // Safe logging
      }, 'User creation failed');
      
      if (error instanceof ValidationError) {
        throw new UserValidationError(error.message, correlationId);
      }
      
      if (error instanceof DatabaseError) {
        throw new UserCreationError('Database operation failed', correlationId);
      }
      
      throw new InternalServerError('User creation failed', correlationId);
    }
  }
}
```

### Configuration Management with Zod

```typescript
// ✅ Enterprise: Comprehensive environment configuration
const EnvSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().min(1000).max(65535).default(3000),
  HOST: z.string().default('0.0.0.0'),
  
  // Database configuration
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().min(1).max(50).default(10),
  DATABASE_TIMEOUT: z.coerce.number().min(1000).default(30000),
  
  // Security configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),
  
  // External services
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  
  // Feature flags
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  ENABLE_METRICS: z.coerce.boolean().default(true),
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
}).refine(data => {
  // Business rule: Production must have all security configs
  if (data.NODE_ENV === 'production') {
    return data.JWT_SECRET && data.DATABASE_URL && data.BCRYPT_ROUNDS >= 12;
  }
  return true;
}, {
  message: "Production environment requires all security configurations",
});

export type AppConfig = z.infer<typeof EnvSchema>;

// Safe configuration logging (redacts secrets)
function getLoggableConfig(config: AppConfig): Record<string, unknown> {
  return {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    HOST: config.HOST,
    DATABASE_POOL_SIZE: config.DATABASE_POOL_SIZE,
    BCRYPT_ROUNDS: config.BCRYPT_ROUNDS,
    ENABLE_RATE_LIMITING: config.ENABLE_RATE_LIMITING,
    ENABLE_METRICS: config.ENABLE_METRICS,
    LOG_LEVEL: config.LOG_LEVEL,
    // Secrets are omitted for security
  };
}
```

### Plugin Architecture with Dependency Injection

```typescript
// ✅ Enterprise: Robust plugin with full DI support
declare module 'fastify' {
  interface FastifyInstance {
    userService: UserService;
    auditService: AuditService;
    notificationService: NotificationService;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  // Register dependencies first
  await fastify.register(databasePlugin);
  await fastify.register(loggerPlugin);
  await fastify.register(metricsPlugin);
  
  // Initialize services with dependencies
  const auditService = new AuditServiceImpl(
    fastify.db,
    fastify.logger,
    fastify.metrics
  );
  
  const notificationService = new NotificationServiceImpl(
    fastify.config,
    fastify.logger
  );
  
  const userService = new UserServiceImpl(
    fastify.db,
    fastify.logger,
    auditService,
    notificationService
  );
  
  // Decorate Fastify instance
  fastify.decorate('auditService', auditService);
  fastify.decorate('notificationService', notificationService);
  fastify.decorate('userService', userService);
  
  // Add graceful shutdown
  fastify.addHook('onClose', async () => {
    await userService.shutdown();
    await notificationService.shutdown();
    await auditService.shutdown();
  });
  
}, {
  name: 'user-services',
  dependencies: ['database', 'logger', 'metrics']
});
```

## Testing Excellence

### Comprehensive Unit Testing Strategy

```typescript
// ✅ Enterprise: Complete test suite with all scenarios
describe('UserService', () => {
  let userService: UserServiceImpl;
  let mockDb: jest.Mocked<Database>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockLogger: jest.Mocked<Logger>;
  let testContext: RequestContext;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockAuditService = createMockAuditService();
    mockLogger = createMockLogger();
    
    userService = new UserServiceImpl(
      mockDb,
      mockLogger,
      mockAuditService
    );
    
    testContext = {
      correlationId: 'test-correlation-id',
      userId: 'test-user-id',
      ip: '127.0.0.1',
      userAgent: 'test-agent'
    };
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePassword123!'
    };

    it('should create user successfully with valid data', async () => {
      // Arrange
      const expectedUser = { id: 'user-123', ...validUserData };
      mockDb.users.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(validUserData, testContext);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockDb.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: validUserData.email,
          name: validUserData.name
        })
      });
      expect(mockAuditService.logUserCreation).toHaveBeenCalledWith(
        expectedUser.id,
        testContext
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: testContext.correlationId,
          userId: expectedUser.id
        }),
        'User created successfully'
      );
    });

    it('should handle database constraint violations', async () => {
      // Arrange
      const dbError = new Error('Unique constraint violation');
      dbError.code = 'P2002'; // Prisma unique constraint error
      mockDb.users.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        userService.createUser(validUserData, testContext)
      ).rejects.toThrow(UserValidationError);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: testContext.correlationId,
          error: dbError.message
        }),
        'User creation failed'
      );
    });

    it('should handle network timeouts gracefully', async () => {
      // Arrange
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';
      mockDb.users.create.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(
        userService.createUser(validUserData, testContext)
      ).rejects.toThrow(UserCreationError);
    });

    it('should validate business rules before creation', async () => {
      // Arrange
      const invalidUser = { ...validUserData, email: 'admin@company.com' };
      jest.spyOn(userService, 'validateUserCreationRules')
          .mockRejectedValue(new ValidationError('Admin email not allowed'));

      // Act & Assert
      await expect(
        userService.createUser(invalidUser, testContext)
      ).rejects.toThrow(UserValidationError);
      
      expect(mockDb.users.create).not.toHaveBeenCalled();
    });
  });
});
```

### Integration Testing with Real Database

```typescript
// ✅ Enterprise: Integration tests with test database
describe('User API Integration', () => {
  let app: FastifyInstance;
  let testDb: TestDatabase;

  beforeAll(async () => {
    // Setup test database
    testDb = await setupTestDatabase();
    
    // Build app with test config
    app = await buildTestApp({
      database: testDb.url,
      logLevel: 'silent'
    });
  });

  afterAll(async () => {
    await app.close();
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.reset();
  });

  describe('POST /users', () => {
    it('should create user and return 201', async () => {
      // Arrange
      const userData = {
        email: 'integration@test.com',
        name: 'Integration Test',
        password: 'SecurePassword123!'
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: userData,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': 'test-correlation-id'
        }
      });

      // Assert
      expect(response.statusCode).toBe(201);
      
      const responseBody = response.json();
      expect(responseBody).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: userData.name,
        createdAt: expect.any(String)
      });
      expect(responseBody.password).toBeUndefined();

      // Verify database state
      const userInDb = await testDb.users.findUnique({
        where: { email: userData.email }
      });
      expect(userInDb).toBeTruthy();
      expect(userInDb.email).toBe(userData.email);
    });

    it('should handle concurrent user creation', async () => {
      // Arrange
      const userData = {
        email: 'concurrent@test.com',
        name: 'Concurrent Test',
        password: 'SecurePassword123!'
      };

      // Act - Create two users simultaneously
      const [response1, response2] = await Promise.allSettled([
        app.inject({
          method: 'POST',
          url: '/users',
          payload: userData
        }),
        app.inject({
          method: 'POST',
          url: '/users',
          payload: userData
        })
      ]);

      // Assert - One succeeds, one fails
      const responses = [response1, response2];
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201);
      const failed = responses.filter(r => r.status === 'fulfilled' && r.value.statusCode === 400);
      
      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
    });
  });
});
```

## Security & Performance

### Input Sanitization and Validation

```typescript
// ✅ Enterprise: Comprehensive input validation
const CreateUserSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform(email => email.toLowerCase().trim()),
    
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .transform(name => name.trim()),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
           
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .transform(phone => phone?.replace(/\D/g, '')),
    
  dateOfBirth: z.string()
    .datetime('Invalid date format')
    .optional()
    .refine(date => {
      if (!date) return true;
      const birthDate = new Date(date);
      const age = (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 13 && age <= 120;
    }, 'Invalid age range'),
    
  preferences: z.object({
    newsletter: z.boolean().default(false),
    notifications: z.boolean().default(true),
    theme: z.enum(['light', 'dark', 'auto']).default('auto')
  }).optional()
    
}).refine(data => {
  // Business rule: Corporate emails require approval
  if (data.email.endsWith('@company.com')) {
    return false;
  }
  return true;
}, {
  message: "Corporate emails require manual approval",
  path: ["email"]
});
```

### Rate Limiting and Performance

```typescript
// ✅ Enterprise: Sophisticated rate limiting
export const rateLimitConfig = {
  // Global rate limit
  global: {
    max: 1000,
    timeWindow: '1 minute'
  },
  
  // Per-endpoint limits
  '/auth/login': {
    max: 5,
    timeWindow: '15 minutes',
    keyGenerator: (req: FastifyRequest) => req.ip
  },
  
  '/users': {
    max: 10,
    timeWindow: '1 minute',
    keyGenerator: (req: FastifyRequest) => req.ip
  },
  
  // Authenticated user limits
  authenticated: {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req: FastifyRequest) => req.user?.id || req.ip
  }
};

// Performance monitoring middleware
export const performanceMonitoring = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const start = Date.now();
  
  reply.header('X-Request-ID', request.id);
  
  await reply.send();
  
  const duration = Date.now() - start;
  
  // Log slow requests
  if (duration > 1000) {
    request.log.warn({
      requestId: request.id,
      method: request.method,
      url: request.url,
      duration,
      userAgent: request.headers['user-agent']
    }, 'Slow request detected');
  }
  
  // Metrics
  request.server.metrics?.histogram('http_request_duration', duration, {
    method: request.method,
    route: request.routerPath,
    status_code: reply.statusCode.toString()
  });
};
```

Following these enterprise patterns ensures that AI-generated code integrates seamlessly with the project's architecture, maintains the highest quality standards, and follows established patterns used by expert engineering teams. 