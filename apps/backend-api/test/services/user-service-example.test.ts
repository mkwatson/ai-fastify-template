/**
 * Tests for Result-based UserService example
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  UserService,
  createMockUserService,
  type User,
  type UserRepository,
} from '../../src/services/user-service-example.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalError,
} from '../../src/utils/result.js';

describe('UserService (Result-based)', () => {
  let userService: UserService;
  let mockRepository: UserRepository;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

    userService = new UserService(mockRepository, mockLogger);
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'user@example.com',
      name: 'John Doe',
      phone: '(555) 123-4567',
      password: 'SecurePassword123!',
    };

    it('should create user successfully', async () => {
      const createdUser: User = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'John Doe',
        phone: '(555) 123-4567',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue(createdUser);

      const result = await userService.createUser(validUserData);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(createdUser);
      }

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'user@example.com'
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...validUserData,
        isActive: true,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId: 'user_1', email: 'user@example.com' },
        'User created successfully'
      );
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'John Doe',
      };

      const result = await userService.createUser(invalidData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.field).toBe('email');
      }

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return conflict error when user already exists', async () => {
      const existingUser: User = {
        id: 'existing_user',
        email: 'user@example.com',
        name: 'Existing User',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser);

      const result = await userService.createUser(validUserData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ConflictError);
        expect(result.error.message).toContain('already exists');
        expect(result.error.context?.email).toBe('user@example.com');
      }

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return internal error when database fails', async () => {
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockRejectedValue(
        new Error('Database error')
      );

      const result = await userService.createUser(validUserData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe('Failed to create user');
      }

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle email check database error', async () => {
      vi.mocked(mockRepository.findByEmail).mockRejectedValue(
        new Error('DB connection failed')
      );

      const result = await userService.createUser(validUserData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe('Failed to check existing user');
      }

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should find user successfully', async () => {
      const user: User = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(user);

      const result = await userService.findUserById('user_1');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(user);
      }

      expect(mockRepository.findById).toHaveBeenCalledWith('user_1');
    });

    it('should return not found error when user does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await userService.findUserById('nonexistent');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(NotFoundError);
        expect(result.error.message).toContain('User');
        expect(result.error.context?.id).toBe('nonexistent');
      }

      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should return internal error when database fails', async () => {
      vi.mocked(mockRepository.findById).mockRejectedValue(
        new Error('Database error')
      );

      const result = await userService.findUserById('user_1');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe('Failed to query user');
      }

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const existingUser: User = {
      id: 'user_1',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    it('should update user successfully', async () => {
      const updateData = { name: 'Jane Doe' };
      const updatedUser = { ...existingUser, name: 'Jane Doe' };

      vi.mocked(mockRepository.findById).mockResolvedValue(existingUser);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user_1', updateData);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(updatedUser);
      }

      expect(mockRepository.update).toHaveBeenCalledWith('user_1', updateData);
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId: 'user_1' },
        'User updated successfully'
      );
    });

    it('should return validation error for invalid update data', async () => {
      const invalidData = { email: 'invalid-email' };

      const result = await userService.updateUser('user_1', invalidData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.field).toBe('email');
      }

      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return not found error when user does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await userService.updateUser('nonexistent', {
        name: 'New Name',
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(NotFoundError);
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return conflict error when updating email to existing email', async () => {
      const anotherUser: User = {
        id: 'user_2',
        email: 'another@example.com',
        name: 'Another User',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(existingUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(anotherUser);

      const result = await userService.updateUser('user_1', {
        email: 'another@example.com',
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ConflictError);
        expect(result.error.message).toContain('already in use');
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      const updateData = { email: 'user@example.com', name: 'Updated Name' };
      const updatedUser = { ...existingUser, name: 'Updated Name' };

      vi.mocked(mockRepository.findById).mockResolvedValue(existingUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user_1', updateData);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(updatedUser);
      }

      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    const existingUser: User = {
      id: 'user_1',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    it('should delete user successfully', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(existingUser);
      vi.mocked(mockRepository.delete).mockResolvedValue(true);

      const result = await userService.deleteUser('user_1');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeUndefined();
      }

      expect(mockRepository.delete).toHaveBeenCalledWith('user_1');
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId: 'user_1' },
        'User deleted successfully'
      );
    });

    it('should return not found error when user does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await userService.deleteUser('nonexistent');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(NotFoundError);
      }

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should return internal error when deletion fails', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(existingUser);
      vi.mocked(mockRepository.delete).mockRejectedValue(
        new Error('Database error')
      );

      const result = await userService.deleteUser('user_1');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe('Failed to delete user');
      }
    });
  });

  describe('listUsers', () => {
    it('should list users successfully', async () => {
      const users: User[] = [
        {
          id: 'user_1',
          email: 'user1@example.com',
          name: 'User 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
        {
          id: 'user_2',
          email: 'user2@example.com',
          name: 'User 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
      ];

      vi.mocked(mockRepository.list).mockResolvedValue(users);

      const result = await userService.listUsers({ limit: 10, offset: 0 });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(users);
      }

      expect(mockRepository.list).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        { userCount: 2 },
        'Users retrieved successfully'
      );
    });

    it('should return internal error when listing fails', async () => {
      vi.mocked(mockRepository.list).mockRejectedValue(
        new Error('Database error')
      );

      const result = await userService.listUsers();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe('Failed to list users');
      }
    });
  });

  describe('createMultipleUsers', () => {
    const usersData = [
      {
        email: 'user1@example.com',
        name: 'User 1',
        password: 'StrongPass123!',
      },
      {
        email: 'user2@example.com',
        name: 'User 2',
        password: 'StrongPass456!',
      },
    ];

    it('should create multiple users successfully', async () => {
      const createdUsers: User[] = [
        {
          id: 'user_1',
          email: 'user1@example.com',
          name: 'User 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
        {
          id: 'user_2',
          email: 'user2@example.com',
          name: 'User 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
      ];

      // Mock repository calls for batch creation
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null); // No existing users
      vi.mocked(mockRepository.create)
        .mockResolvedValueOnce(createdUsers[0])
        .mockResolvedValueOnce(createdUsers[1]);

      const result = await userService.createMultipleUsers(usersData);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(createdUsers);
      }

      expect(mockRepository.findByEmail).toHaveBeenCalledTimes(2);
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        { userCount: 2 },
        'Batch user creation completed successfully'
      );
    });

    it('should return validation error for invalid user data', async () => {
      const invalidUsersData = [
        {
          email: 'invalid-email',
          name: 'User 1',
        },
      ];

      const result = await userService.createMultipleUsers(invalidUsersData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should stop on first creation failure', async () => {
      const existingUser = {
        id: 'existing_user',
        email: 'user2@example.com',
        name: 'Existing User',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      // First email check: no user (success)
      // Second email check: user exists (conflict)
      vi.mocked(mockRepository.findByEmail)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUser);

      vi.mocked(mockRepository.create).mockResolvedValueOnce({
        id: 'user_1',
        email: 'user1@example.com',
        name: 'User 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });

      const result = await userService.createMultipleUsers(usersData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ConflictError);
      }

      expect(mockRepository.findByEmail).toHaveBeenCalledTimes(2);
      expect(mockRepository.create).toHaveBeenCalledTimes(1); // Only first user created
      expect(mockLogger.warn).toHaveBeenCalled(); // Conflict errors log as warnings
    });
  });

  describe('Mock Service Factory', () => {
    it('should create mock service for testing', () => {
      const mockService = createMockUserService(mockLogger);

      expect(mockService).toBeInstanceOf(UserService);
      expect(mockService).toBeDefined();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle repository returning null for update', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue({
        id: 'user_1',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
      vi.mocked(mockRepository.update).mockResolvedValue(null);

      const result = await userService.updateUser('user_1', {
        name: 'New Name',
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(NotFoundError);
      }
    });

    it('should handle repository returning false for delete', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue({
        id: 'user_1',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
      vi.mocked(mockRepository.delete).mockResolvedValue(false);

      const result = await userService.deleteUser('user_1');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(NotFoundError);
      }
    });

    it('should handle deactivateUser properly', async () => {
      const user: User = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const deactivatedUser = { ...user, isActive: false };

      // Mock updateUser method
      const updateUserSpy = vi.spyOn(userService, 'updateUser');
      updateUserSpy.mockResolvedValue({
        isOk: () => true,
        value: deactivatedUser,
      } as any);

      const result = await userService.deactivateUser('user_1');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.isActive).toBe(false);
      }

      expect(updateUserSpy).toHaveBeenCalledWith('user_1', { isActive: false });

      updateUserSpy.mockRestore();
    });
  });
});
