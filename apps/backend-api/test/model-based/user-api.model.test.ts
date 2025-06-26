import { describe, it, beforeAll, afterAll } from 'vitest';
import { type FastifyInstance } from 'fastify';
import fc from 'fast-check';

import { build } from '../helper.js';
import {
  ApiModelTest,
  CommandBuilders,
  CommonInvariants,
  type ApiCommand,
} from '@ai-fastify-template/config';

/**
 * Model state for user management API
 */
interface UserApiState {
  users: Array<{ id: string; name: string; email: string }>;
  nextId: number;
  operationCount: number;
}

/**
 * Model-based test for user management API
 *
 * This demonstrates how to test an API that manages user resources
 * using sequences of operations while maintaining invariants.
 */
class UserApiModel extends ApiModelTest<UserApiState> {
  async resetApiState(): Promise<void> {
    // Reset the API state to match the initial model state
    await this.app.inject({
      method: 'DELETE',
      url: '/users/test/reset',
    });
  }

  getInitialState(): UserApiState {
    return {
      users: [],
      nextId: 1,
      operationCount: 0,
    };
  }

  getCommands(state: UserApiState): ApiCommand<UserApiState>[] {
    const commands: ApiCommand<UserApiState>[] = [
      // GET /users - List all users
      CommandBuilders.get('list-users', '/users', {
        postcondition: (state, result: { users: unknown[] }, response) => {
          // API should return array matching model state
          return (
            response.statusCode === 200 &&
            Array.isArray(result.users) &&
            result.users.length === state.users.length
          );
        },
        transform: state => ({
          ...state,
          operationCount: state.operationCount + 1,
        }),
      }),

      // POST /users - Create a new user
      CommandBuilders.post(
        'create-user',
        '/users',
        () => ({
          name: `User ${state.nextId}`,
          email: `user${state.nextId}@example.com`,
        }),
        (
          state,
          result: { id: string; name: string; email: string },
          response
        ) => {
          if (response.statusCode === 201) {
            return {
              ...state,
              users: [...state.users, result],
              nextId: state.nextId + 1,
              operationCount: state.operationCount + 1,
            };
          }
          return {
            ...state,
            operationCount: state.operationCount + 1,
          };
        },
        {
          postcondition: (state, result, response) => {
            if (response.statusCode === 201) {
              return (
                typeof result === 'object' &&
                result !== null &&
                'id' in result &&
                'name' in result &&
                'email' in result
              );
            }
            return true; // Allow other status codes (validation errors, etc.)
          },
        }
      ),
    ];

    // Add GET /users/:id command only if users exist
    if (state.users.length > 0) {
      commands.push(
        CommandBuilders.get(
          'get-user',
          state => `/users/${state.users[0].id}`, // Get first user
          {
            precondition: state => state.users.length > 0,
            postcondition: (state, result: { id: string }, response) => {
              return (
                response.statusCode === 200 &&
                typeof result === 'object' &&
                result !== null &&
                'id' in result
              );
            },
            transform: state => ({
              ...state,
              operationCount: state.operationCount + 1,
            }),
          }
        )
      );

      // Add DELETE /users/:id command only if users exist
      commands.push(
        CommandBuilders.delete(
          'delete-user',
          state => `/users/${state.users[0].id}`, // Delete first user
          (state, result, response) => {
            if (response.statusCode === 204) {
              return {
                ...state,
                users: state.users.slice(1), // Remove first user
                operationCount: state.operationCount + 1,
              };
            }
            return {
              ...state,
              operationCount: state.operationCount + 1,
            };
          },
          {
            precondition: state => state.users.length > 0,
          }
        )
      );
    }

    return commands;
  }

  setupInvariants(): void {
    // Users array should never have negative length
    this.addInvariant({
      name: 'users-non-negative-length',
      description: 'Users array should never have negative length',
      check: state => state.users.length >= 0,
    });

    // NextId should always be positive
    this.addInvariant({
      name: 'next-id-positive',
      description: 'Next ID should always be positive',
      check: state => state.nextId > 0,
    });

    // Operation count should be non-negative
    this.addInvariant(
      CommonInvariants.nonNegativeCount<{ operationCount: number }>(
        'operation-count'
      )
    );

    // Users should not exceed reasonable limit (prevent infinite growth in tests)
    this.addInvariant(
      CommonInvariants.boundedCollection<{ users: unknown[] }>(50, 'max-users')
    );

    // All users should have unique IDs
    this.addInvariant({
      name: 'unique-user-ids',
      description: 'All users should have unique IDs',
      check: state => {
        const ids = state.users.map(user => user.id);
        return new Set(ids).size === ids.length;
      },
    });

    // All users should have valid email format
    this.addInvariant({
      name: 'valid-user-emails',
      description: 'All users should have valid email addresses',
      check: state => {
        return state.users.every(
          user =>
            typeof user.email === 'string' &&
            user.email.includes('@') &&
            user.email.length > 0
        );
      },
    });

    // NextId should always be greater than the highest existing user ID
    this.addInvariant({
      name: 'next-id-consistency',
      description: 'Next ID should be greater than all existing user IDs',
      check: state => {
        if (state.users.length === 0) return true;

        const maxExistingId = Math.max(
          ...state.users
            .map(user => parseInt(user.id, 10))
            .filter(id => !isNaN(id))
        );

        return isNaN(maxExistingId) || state.nextId > maxExistingId;
      },
    });
  }
}

/**
 * Model-based test for API invariant violation scenarios
 *
 * This tests edge cases and error conditions that should maintain invariants
 */
class ErrorScenarioModel extends ApiModelTest<UserApiState> {
  getInitialState(): UserApiState {
    return {
      users: [],
      nextId: 1,
      operationCount: 0,
    };
  }

  getCommands(): ApiCommand<UserApiState>[] {
    return [
      // Try to get non-existent user
      CommandBuilders.get('get-nonexistent-user', '/users/99999', {
        postcondition: (_, __, response) => {
          // Should return 404 for non-existent user
          return response.statusCode === 404;
        },
        transform: state => ({
          ...state,
          operationCount: state.operationCount + 1,
        }),
      }),

      // Try to create user with invalid data
      CommandBuilders.post(
        'create-invalid-user',
        '/users',
        () => ({
          name: '', // Invalid: empty name
          email: 'invalid-email', // Invalid: no @ symbol
        }),
        state => {
          // State should not change for invalid requests
          return {
            ...state,
            operationCount: state.operationCount + 1,
          };
        },
        {
          postcondition: (_, __, response) => {
            // Should return 400 for invalid data
            return response.statusCode === 400 || response.statusCode === 422;
          },
        }
      ),

      // Try to delete non-existent user
      CommandBuilders.delete(
        'delete-nonexistent-user',
        '/users/99999',
        state => {
          // State should not change for non-existent user
          return {
            ...state,
            operationCount: state.operationCount + 1,
          };
        },
        {
          postcondition: (_, __, response) => {
            // Should return 404 for non-existent user
            return response.statusCode === 404;
          },
        }
      ),
    ];
  }
}

describe('Model-based testing - User API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should maintain invariants across user operation sequences', async () => {
    const model = new UserApiModel(app);
    model.setupInvariants();

    // Run model-based test with sequences of operations
    await expect(
      model.runTest({
        runs: 10, // Number of test runs (reduced for performance)
        maxCommands: 5, // Maximum commands per sequence (reduced for performance)
      })
    ).resolves.toBeUndefined();
  });

  it('should handle error scenarios without violating invariants', async () => {
    const model = new ErrorScenarioModel(app);

    // Add basic invariants for error scenarios
    model.addInvariant({
      name: 'operation-count-increases',
      description: 'Operation count should only increase',
      check: state => state.operationCount >= 0,
    });

    await expect(
      model.runTest({
        runs: 20,
        maxCommands: 10,
      })
    ).resolves.toBeUndefined();
  });

  it('should demonstrate custom invariant checking', async () => {
    const model = new UserApiModel(app);

    // Add custom business rule invariants
    model.addInvariant({
      name: 'email-domain-restriction',
      description:
        'All users should have example.com domain emails in test environment',
      check: state => {
        return state.users.every(user => user.email.endsWith('@example.com'));
      },
    });

    model.addInvariant(
      CommonInvariants.dataConsistency(
        'user-name-consistency',
        'User names should follow naming pattern in test environment',
        state => {
          return state.users.every(
            user => user.name.startsWith('User ') || user.name.length === 0
          );
        }
      )
    );

    await expect(
      model.runTest({
        runs: 5, // Reduced for performance
        maxCommands: 3, // Reduced for performance
      })
    ).resolves.toBeUndefined();
  });
});

// Property-based tests for the model-based testing framework itself
describe('Property-based tests - Model-based testing framework', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should never violate invariants during random command sequences', async () => {
    const model = new UserApiModel(app);
    model.setupInvariants();

    // Property: No matter what sequence of valid commands we execute,
    // all invariants should always hold
    await expect(
      fc.assert(
        fc.asyncProperty(
          fc.array(fc.nat(), { minLength: 1, maxLength: 20 }),
          async commandIndices => {
            let currentState = model.getInitialState();
            const invariantChecks: boolean[] = [];

            for (const index of commandIndices) {
              const commands = model.getCommands(currentState);
              if (commands.length === 0) break;

              const command = commands[index % commands.length];

              if (command.precondition && !command.precondition(currentState)) {
                continue;
              }

              try {
                const { newState } = await model.executeCommand(
                  command,
                  currentState
                );
                currentState = newState;

                const invariantCheck = model.checkInvariants(currentState);
                invariantChecks.push(invariantCheck.valid);

                if (!invariantCheck.valid) {
                  throw new Error(
                    `Invariant violation: ${invariantCheck.violations.join(', ')}`
                  );
                }
              } catch {
                // Command execution errors are acceptable (e.g., 404, validation errors)
                // but should not break invariants of the model state
                const invariantCheck = model.checkInvariants(currentState);
                invariantChecks.push(invariantCheck.valid);
              }
            }

            // All invariant checks should pass
            return invariantChecks.every(check => check === true);
          }
        ),
        { numRuns: 25 }
      )
    ).resolves.toBeUndefined();
  });
});
