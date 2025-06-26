/**
 * Example user service demonstrating Result-based error handling patterns
 *
 * This service shows how to implement business logic using Result types
 * for explicit error handling instead of throwing exceptions.
 *
 * @module user-service-example
 */

import type { FastifyLoggerInstance } from 'fastify';

import {
  ok,
  err,
  ResultUtils,
  type AsyncServiceResult,
  NotFoundError,
  ConflictError,
  InternalError,
  createService,
} from '../utils/result.js';
import {
  validateUserRegistration,
  validateUserProfileUpdate,
} from '../utils/validators-result.js';

/**
 * User entity type
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * User creation input (without generated fields)
 */
export type CreateUserInput = {
  email: string;
  name: string;
  phone?: string;
  password?: string;
  isActive?: boolean;
};

/**
 * User repository interface (would be implemented by database layer)
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserInput): Promise<User>;
  update(id: string, userData: Partial<CreateUserInput>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  list(options?: { limit?: number; offset?: number }): Promise<User[]>;
}

/**
 * Mock repository implementation for demonstration
 */
class MockUserRepository implements UserRepository {
  private readonly users: Map<string, User> = new Map();
  private nextId = 1;

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  create(userData: CreateUserInput): Promise<User> {
    const user: User = {
      ...userData,
      id: `user_${this.nextId++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: userData.isActive ?? true,
    };
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  update(id: string, userData: Partial<CreateUserInput>): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return Promise.resolve(null);
    }

    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return Promise.resolve(updatedUser);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.users.delete(id));
  }

  list(options?: { limit?: number; offset?: number }): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? allUsers.length;
    return Promise.resolve(allUsers.slice(offset, offset + limit));
  }
}

/**
 * User service with Result-based error handling
 */
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly logger: FastifyLoggerInstance
  ) {}

  /**
   * Create a new user with validation
   */
  async createUser(data: unknown): AsyncServiceResult<User> {
    this.logger.info({ operation: 'createUser' }, 'Creating new user');

    // Validate input data
    const validationResult = validateUserRegistration(data);
    if (validationResult.isErr()) {
      this.logger.warn(
        { error: validationResult.error.toSafeObject() },
        'User creation failed: validation error'
      );
      return err(validationResult.error);
    }

    const userData = validationResult.value;

    // Check if user already exists
    const existingUserResult = await this.findUserByEmail(userData.email);
    if (existingUserResult.isOk()) {
      const conflictError = new ConflictError(
        'User',
        `User with email ${userData.email} already exists`,
        { email: userData.email }
      );
      this.logger.warn(
        { error: conflictError.toSafeObject() },
        'User creation failed: email already exists'
      );
      return err(conflictError);
    }

    // Create user (wrap potential database errors)
    // Filter out undefined values
    const cleanUserData: CreateUserInput = {
      email: userData.email,
      name: userData.name,
      ...(userData.phone ? { phone: userData.phone } : {}),
      ...(userData.password ? { password: userData.password } : {}),
    };

    const createResult = await ResultUtils.fromPromise(
      this.repository.create({
        ...cleanUserData,
        isActive: true,
      }),
      error =>
        new InternalError('Failed to create user', { originalError: error })
    );

    if (createResult.isErr()) {
      this.logger.error(
        { error: createResult.error.toSafeObject() },
        'User creation failed: database error'
      );
      return err(createResult.error);
    }

    const user = createResult.value;
    this.logger.info(
      { userId: user.id, email: user.email },
      'User created successfully'
    );

    return ok(user);
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): AsyncServiceResult<User> {
    this.logger.debug({ userId: id }, 'Finding user by ID');

    const result = await ResultUtils.fromPromise(
      this.repository.findById(id),
      error =>
        new InternalError('Failed to query user', { originalError: error })
    );

    if (result.isErr()) {
      this.logger.error(
        { error: result.error.toSafeObject(), userId: id },
        'Failed to find user by ID'
      );
      return err(result.error);
    }

    if (result.value === null) {
      const notFoundError = new NotFoundError('User', id);
      this.logger.debug(
        { error: notFoundError.toSafeObject() },
        'User not found'
      );
      return err(notFoundError);
    }

    return ok(result.value);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): AsyncServiceResult<User> {
    this.logger.debug({ email }, 'Finding user by email');

    // Note: Could validate email format here if needed

    // For async operations, we need to handle this differently
    const result = await ResultUtils.fromPromise(
      this.repository.findByEmail(email),
      error =>
        new InternalError('Failed to query user', { originalError: error })
    );

    if (result.isErr()) {
      this.logger.error(
        { error: result.error.toSafeObject(), email },
        'Failed to find user by email'
      );
      return err(result.error);
    }

    if (result.value === null) {
      const notFoundError = new NotFoundError('User', email);
      this.logger.debug(
        { error: notFoundError.toSafeObject() },
        'User not found by email'
      );
      return err(notFoundError);
    }

    return ok(result.value);
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, updateData: unknown): AsyncServiceResult<User> {
    this.logger.info({ userId: id }, 'Updating user');

    // Validate update data
    const validationResult = validateUserProfileUpdate(updateData);
    if (validationResult.isErr()) {
      this.logger.warn(
        { error: validationResult.error.toSafeObject(), userId: id },
        'User update failed: validation error'
      );
      return err(validationResult.error);
    }

    const validatedData = validationResult.value;

    // Check if user exists first
    const userResult = await this.findUserById(id);
    if (userResult.isErr()) {
      return err(userResult.error);
    }

    // If updating email, check for conflicts
    if (validatedData.email) {
      const emailCheckResult = await this.findUserByEmail(validatedData.email);
      if (emailCheckResult.isOk() && emailCheckResult.value.id !== id) {
        const conflictError = new ConflictError(
          'User',
          `Email ${validatedData.email} is already in use`,
          { email: validatedData.email, userId: id }
        );
        this.logger.warn(
          { error: conflictError.toSafeObject() },
          'User update failed: email conflict'
        );
        return err(conflictError);
      }
    }

    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(validatedData).filter(([, value]) => value !== undefined)
    ) as Partial<CreateUserInput>;

    // Perform update
    const updateResult = await ResultUtils.fromPromise(
      this.repository.update(id, filteredData),
      error =>
        new InternalError('Failed to update user', { originalError: error })
    );

    if (updateResult.isErr()) {
      this.logger.error(
        { error: updateResult.error.toSafeObject(), userId: id },
        'User update failed: database error'
      );
      return err(updateResult.error);
    }

    if (updateResult.value === null) {
      // This shouldn't happen since we checked existence above
      const notFoundError = new NotFoundError('User', id);
      return err(notFoundError);
    }

    const updatedUser = updateResult.value;
    this.logger.info({ userId: updatedUser.id }, 'User updated successfully');

    return ok(updatedUser);
  }

  /**
   * Deactivate user (soft delete)
   */
  deactivateUser(id: string): AsyncServiceResult<User> {
    this.logger.info({ userId: id }, 'Deactivating user');

    return this.updateUser(id, { isActive: false });
  }

  /**
   * Delete user permanently
   */
  async deleteUser(id: string): AsyncServiceResult<void> {
    this.logger.info({ userId: id }, 'Deleting user permanently');

    // Check if user exists first
    const userResult = await this.findUserById(id);
    if (userResult.isErr()) {
      return err(userResult.error);
    }

    const deleteResult = await ResultUtils.fromPromise(
      this.repository.delete(id),
      error =>
        new InternalError('Failed to delete user', { originalError: error })
    );

    if (deleteResult.isErr()) {
      this.logger.error(
        { error: deleteResult.error.toSafeObject(), userId: id },
        'User deletion failed: database error'
      );
      return err(deleteResult.error);
    }

    if (!deleteResult.value) {
      // This shouldn't happen since we checked existence above
      const notFoundError = new NotFoundError('User', id);
      return err(notFoundError);
    }

    this.logger.info({ userId: id }, 'User deleted successfully');
    return ok(undefined);
  }

  /**
   * List users with pagination
   */
  async listUsers(options?: {
    limit?: number;
    offset?: number;
  }): AsyncServiceResult<User[]> {
    this.logger.debug({ options }, 'Listing users');

    const listResult = await ResultUtils.fromPromise(
      this.repository.list(options),
      error =>
        new InternalError('Failed to list users', { originalError: error })
    );

    if (listResult.isErr()) {
      this.logger.error(
        { error: listResult.error.toSafeObject() },
        'Failed to list users'
      );
      return err(listResult.error);
    }

    this.logger.debug(
      { userCount: listResult.value.length },
      'Users retrieved successfully'
    );

    return ok(listResult.value);
  }

  /**
   * Get user count for admin purposes
   */
  async getUserCount(): AsyncServiceResult<number> {
    const usersResult = await this.listUsers();
    if (usersResult.isErr()) {
      return err(usersResult.error);
    }

    return ok(usersResult.value.length);
  }

  /**
   * Batch operation: Create multiple users
   */
  async createMultipleUsers(usersData: unknown[]): AsyncServiceResult<User[]> {
    this.logger.info(
      { userCount: usersData.length },
      'Creating multiple users'
    );

    // Validate all user data first
    const validationResults = usersData.map(data =>
      validateUserRegistration(data)
    );
    const validationErrors = ResultUtils.collectErrors(validationResults);

    if (validationErrors.length > 0) {
      this.logger.warn(
        { errorCount: validationErrors.length },
        'Batch user creation failed: validation errors'
      );
      // We know the array has at least one error since length > 0
      return err(validationErrors[0]!); // Return first error for simplicity
    }

    const validatedUsers = ResultUtils.collectSuccesses(validationResults);

    // Create users sequentially to avoid race conditions
    const createdUsers: User[] = [];
    for (const userData of validatedUsers) {
      const createResult = await this.createUser(userData);
      if (createResult.isErr()) {
        this.logger.error(
          {
            error: createResult.error.toSafeObject(),
            createdCount: createdUsers.length,
            totalCount: validatedUsers.length,
          },
          'Batch user creation partially failed'
        );
        return err(createResult.error);
      }
      createdUsers.push(createResult.value);
    }

    this.logger.info(
      { userCount: createdUsers.length },
      'Batch user creation completed successfully'
    );

    return ok(createdUsers);
  }
}

/**
 * Factory function to create a UserService with typed methods
 */
export function createUserService(
  repository: UserRepository,
  logger: FastifyLoggerInstance
): UserService {
  return new UserService(repository, logger);
}

/**
 * Mock factory for testing and examples
 */
export function createMockUserService(
  logger: FastifyLoggerInstance
): UserService {
  return createUserService(new MockUserRepository(), logger);
}

/**
 * Type-safe service creation helper
 * This demonstrates how to create strongly typed service interfaces
 */
export const userServiceMethods = createService({
  createUser: (..._args: unknown[]) => {
    // This would be implemented with actual service instance
    return Promise.reject(
      new Error('Not implemented - use actual service instance')
    );
  },
  findUserById: (..._args: unknown[]) => {
    // This would be implemented with actual service instance
    return Promise.reject(
      new Error('Not implemented - use actual service instance')
    );
  },
  // ... other methods
});
