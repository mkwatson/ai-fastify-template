# Result Types Migration Guide

This guide shows how to migrate from traditional throw/catch error handling to explicit Result<T, E> patterns for enterprise-grade error handling.

## 🎯 Why Migrate to Result Types?

- **Explicit error handling**: All error paths are visible in type signatures
- **Composable error handling**: Chain operations without nested try/catch
- **Type safety**: Errors are part of the type system
- **Better testing**: Easier to test error scenarios
- **Functional patterns**: Enables functional programming patterns

## 📋 Migration Patterns

### 1. Basic Function Migration

#### Before: Traditional try/catch

```typescript
// ❌ OLD PATTERN: Throws exceptions
async function getUser(id: string): Promise<User> {
  if (!id) {
    throw new Error('User ID is required');
  }

  const user = await database.findUser(id);
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

// Usage requires try/catch
try {
  const user = await getUser('123');
  console.log(user.name);
} catch (error) {
  console.error('Failed to get user:', error.message);
}
```

#### After: Result types

```typescript
// ✅ NEW PATTERN: Returns Result
import {
  Result,
  ok,
  err,
  type AsyncServiceResult,
  NotFoundError,
  ValidationError,
} from '../utils/result.js';

async function getUser(id: string): AsyncServiceResult<User> {
  if (!id) {
    return err(new ValidationError('User ID is required', 'id'));
  }

  const user = await database.findUser(id);
  if (!user) {
    return err(new NotFoundError('User', id));
  }

  return ok(user);
}

// Usage with explicit error handling
const userResult = await getUser('123');
if (userResult.isOk()) {
  console.log(userResult.value.name);
} else {
  console.error('Failed to get user:', userResult.error.message);
}
```

### 2. Service Layer Migration

#### Before: Service with exceptions

```typescript
// ❌ OLD PATTERN: Service throws exceptions
export class UserService {
  constructor(
    private db: Database,
    private logger: Logger
  ) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validation
    if (!userData.email) {
      throw new Error('Email is required');
    }

    // Check for existing user
    const existing = await this.db.findByEmail(userData.email);
    if (existing) {
      throw new Error('User already exists');
    }

    try {
      const user = await this.db.createUser(userData);
      this.logger.info(`User created: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw new Error('Database error');
    }
  }
}
```

#### After: Service with Result types

```typescript
// ✅ NEW PATTERN: Service returns Results
import {
  Result,
  ok,
  err,
  ResultUtils,
  type AsyncServiceResult,
  ValidationError,
  ConflictError,
  InternalError,
} from '../utils/result.js';

export class UserService {
  constructor(
    private db: Database,
    private logger: Logger
  ) {}

  async createUser(userData: CreateUserRequest): AsyncServiceResult<User> {
    // Validation with Result
    if (!userData.email) {
      const error = new ValidationError('Email is required', 'email');
      this.logger.warn({ error: error.toSafeObject() }, 'User creation failed');
      return err(error);
    }

    // Check for existing user
    const existingResult = await ResultUtils.fromPromise(
      this.db.findByEmail(userData.email),
      error =>
        new InternalError('Failed to check existing user', {
          originalError: error,
        })
    );

    if (existingResult.isErr()) {
      this.logger.error(
        { error: existingResult.error.toSafeObject() },
        'Database query failed'
      );
      return err(existingResult.error);
    }

    if (existingResult.value) {
      const error = new ConflictError('User', 'User already exists', {
        email: userData.email,
      });
      this.logger.warn({ error: error.toSafeObject() }, 'User creation failed');
      return err(error);
    }

    // Create user
    const createResult = await ResultUtils.fromPromise(
      this.db.createUser(userData),
      error =>
        new InternalError('Failed to create user', { originalError: error })
    );

    if (createResult.isErr()) {
      this.logger.error(
        { error: createResult.error.toSafeObject() },
        'User creation failed'
      );
      return err(createResult.error);
    }

    const user = createResult.value;
    this.logger.info({ userId: user.id }, 'User created successfully');
    return ok(user);
  }
}
```

### 3. Route Handler Migration

#### Before: Route with try/catch

```typescript
// ❌ OLD PATTERN: Route with try/catch
fastify.post(
  '/users',
  {
    schema: { body: CreateUserSchema },
  },
  async (request, reply) => {
    try {
      const user = await fastify.userService.createUser(request.body);
      return reply.code(201).send(user);
    } catch (error) {
      fastify.log.error(error, 'User creation failed');

      if (error.message.includes('already exists')) {
        return reply
          .code(409)
          .send({ error: 'Conflict', message: error.message });
      }

      if (error.message.includes('required')) {
        return reply
          .code(400)
          .send({ error: 'Bad Request', message: error.message });
      }

      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
);
```

#### After: Route with Result handling

```typescript
// ✅ NEW PATTERN: Route with Result handling
import { FastifyResultUtils } from '../utils/result.js';

fastify.post(
  '/users',
  {
    schema: {
      body: CreateUserSchema,
      response: {
        201: UserResponseSchema,
        400: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  },
  async (request, reply) => {
    // Automatic error conversion - one line!
    const result = await fastify.userService.createUser(request.body);
    const user = await FastifyResultUtils.handleResult(fastify, result);

    return reply.code(201).send(user);
  }
);

// Alternative: Manual handling for custom logic
fastify.post(
  '/users/manual',
  {
    schema: { body: CreateUserSchema },
  },
  async (request, reply) => {
    const result = await fastify.userService.createUser(request.body);

    if (result.isErr()) {
      const error = result.error;
      fastify.log.error(
        { error: error.toSafeObject() },
        'User creation failed'
      );

      // Custom error handling logic
      if (error instanceof ConflictError) {
        return reply.code(409).send({
          error: 'Conflict',
          message: error.message,
          code: error.code,
        });
      }

      // Convert to HTTP error and throw
      throw FastifyResultUtils.toHttpError(fastify, error);
    }

    return reply.code(201).send(result.value);
  }
);
```

### 4. Validation Function Migration

#### Before: Boolean + try/catch validation

```typescript
// ❌ OLD PATTERN: Boolean validation with exceptions
function validateEmail(email: string): boolean {
  try {
    EmailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

function validateUserData(data: unknown): {
  isValid: boolean;
  errors: string[];
} {
  try {
    UserSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    const zodError = error as z.ZodError;
    return {
      isValid: false,
      errors: zodError.errors.map(err => err.message),
    };
  }
}
```

#### After: Result-based validation

```typescript
// ✅ NEW PATTERN: Result-based validation
import {
  ResultUtils,
  ValidationError,
  type ServiceResult,
} from '../utils/result.js';

function validateEmail(email: string): ServiceResult<string> {
  return ResultUtils.parseZod(EmailSchema, email);
}

function validateUserData(data: unknown): ServiceResult<UserData> {
  return ResultUtils.parseZod(UserSchema, data);
}

// Usage patterns
const emailResult = validateEmail('test@example.com');
if (emailResult.isOk()) {
  console.log('Valid email:', emailResult.value);
} else {
  console.error('Invalid email:', emailResult.error.message);
}

// Chaining validations
const validateUserWithEmail = (data: unknown) => {
  return ResultUtils.chain(validateUserData(data), userData => {
    return ResultUtils.chain(validateEmail(userData.email), email => {
      return ok({ ...userData, email });
    });
  });
};
```

### 5. Utility Function Migration

#### Before: Utility with exceptions

```typescript
// ❌ OLD PATTERN: Utility throws exceptions
function calculateTotal(items: Item[]): number {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (items.length === 0) {
    throw new Error('Items array cannot be empty');
  }

  let total = 0;
  for (const item of items) {
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new Error('Invalid item price');
    }
    total += item.price * item.quantity;
  }

  return total;
}
```

#### After: Utility with Result

```typescript
// ✅ NEW PATTERN: Utility returns Result
function calculateTotal(items: Item[]): ServiceResult<number> {
  if (!Array.isArray(items)) {
    return err(new ValidationError('Items must be an array', 'items'));
  }

  if (items.length === 0) {
    return err(new ValidationError('Items array cannot be empty', 'items'));
  }

  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item.price !== 'number' || item.price < 0) {
      return err(
        new ValidationError(
          `Invalid price for item at index ${i}`,
          `items[${i}].price`
        )
      );
    }
    if (typeof item.quantity !== 'number' || item.quantity < 0) {
      return err(
        new ValidationError(
          `Invalid quantity for item at index ${i}`,
          `items[${i}].quantity`
        )
      );
    }
    total += item.price * item.quantity;
  }

  return ok(total);
}

// Usage with error handling
const totalResult = calculateTotal(cartItems);
if (totalResult.isOk()) {
  console.log('Total:', totalResult.value);
} else {
  console.error('Calculation error:', totalResult.error.message);
}
```

## 🔄 Migration Strategy

### Phase 1: Infrastructure Setup

1. **Install neverthrow**: `pnpm add neverthrow`
2. **Add Result utilities**: Copy `src/utils/result.ts`
3. **Enable ESLint rule**: Add `'ai-patterns/require-result-type': 'error'`
4. **Update TypeScript config**: Ensure strict mode is enabled

### Phase 2: New Code First

1. **All new services**: Use Result types from day one
2. **New routes**: Use FastifyResultUtils for error handling
3. **New utilities**: Return Results instead of throwing

### Phase 3: Gradual Migration

1. **Start with leaf functions**: Migrate utilities and helpers first
2. **Move up the stack**: Services, then routes
3. **Maintain compatibility**: Keep old interfaces during transition
4. **Update tests**: Migrate tests to verify Result behavior

### Phase 4: Complete Migration

1. **Remove old patterns**: Delete try/catch versions
2. **Update documentation**: Ensure all examples use Results
3. **Validate with tools**: Run ESLint to catch remaining patterns

## 🧪 Testing Migration

### Before: Testing exceptions

```typescript
// ❌ OLD PATTERN: Testing thrown exceptions
describe('getUserById', () => {
  it('should throw error for invalid ID', async () => {
    await expect(getUserById('')).rejects.toThrow('User ID is required');
  });

  it('should throw error for non-existent user', async () => {
    await expect(getUserById('999')).rejects.toThrow('User not found');
  });
});
```

### After: Testing Results

```typescript
// ✅ NEW PATTERN: Testing Result values
describe('getUserById', () => {
  it('should return validation error for invalid ID', async () => {
    const result = await getUserById('');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe('User ID is required');
    }
  });

  it('should return not found error for non-existent user', async () => {
    const result = await getUserById('999');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(NotFoundError);
      expect(result.error.message).toContain('User');
    }
  });

  it('should return user for valid ID', async () => {
    const result = await getUserById('123');

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toMatchObject({
        id: '123',
        email: expect.any(String),
        name: expect.any(String),
      });
    }
  });
});
```

## 🚀 Advanced Patterns

### Composing Multiple Operations

```typescript
// Compose multiple Result operations
async function createUserWithProfile(
  userData: CreateUserRequest
): AsyncServiceResult<UserWithProfile> {
  const userResult = await userService.createUser(userData);

  return AsyncResultUtils.chain(userResult, async user => {
    const profileResult = await profileService.createProfile(
      user.id,
      userData.profile
    );

    return ResultUtils.chain(profileResult, profile => {
      return ok({ user, profile });
    });
  });
}
```

### Parallel Operations

```typescript
// Handle multiple parallel operations
async function getUserDashboard(userId: string): AsyncServiceResult<Dashboard> {
  const [userResult, postsResult, friendsResult] = await Promise.all([
    userService.getUser(userId),
    postService.getUserPosts(userId),
    friendService.getUserFriends(userId),
  ]);

  const combinedResult = ResultUtils.combine([
    userResult,
    postsResult,
    friendsResult,
  ]);

  return ResultUtils.chain(combinedResult, ([user, posts, friends]) => {
    return ok({ user, posts, friends });
  });
}
```

## 📚 Best Practices

1. **Start small**: Migrate one function at a time
2. **Test thoroughly**: Ensure error paths are tested
3. **Use type guards**: Check `isOk()` and `isErr()` consistently
4. **Log appropriately**: Use error's `toSafeObject()` for logging
5. **Chain operations**: Use `ResultUtils.chain()` for sequential operations
6. **Handle all cases**: Never ignore Result values
7. **Document errors**: Each error type should have clear documentation

## 🔧 Common Migration Issues

### Issue: Forgetting to check Result

```typescript
// ❌ WRONG: Not checking Result
const result = await getUser('123');
console.log(result.value.name); // Runtime error if result is Err

// ✅ CORRECT: Always check Result
const result = await getUser('123');
if (result.isOk()) {
  console.log(result.value.name);
} else {
  console.error('Error:', result.error.message);
}
```

### Issue: Mixing patterns

```typescript
// ❌ WRONG: Mixing Result and exceptions
async function mixedPattern(id: string): AsyncServiceResult<User> {
  if (!id) {
    throw new Error('ID required'); // Don't throw in Result functions!
  }

  const user = await getUser(id);
  return user;
}

// ✅ CORRECT: Consistent Result pattern
async function consistentPattern(id: string): AsyncServiceResult<User> {
  if (!id) {
    return err(new ValidationError('ID required', 'id'));
  }

  return getUser(id);
}
```

This migration guide provides a comprehensive path from traditional exception-based error handling to explicit Result types, ensuring your codebase becomes more maintainable, testable, and type-safe.
