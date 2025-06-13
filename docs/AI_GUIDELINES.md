# AI Agent Guidelines

This document provides specific guidance for AI coding assistants working with the AI Fastify Template codebase. These guidelines help ensure consistent, high-quality code generation that follows project conventions.

## Table of Contents

- [Core Principles](#core-principles)
- [Code Patterns](#code-patterns)
- [Architecture Rules](#architecture-rules)
- [Quality Standards](#quality-standards)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [Testing Guidelines](#testing-guidelines)
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

Following these guidelines ensures that AI-generated code integrates seamlessly with the project's architecture, maintains high quality standards, and follows established patterns. 