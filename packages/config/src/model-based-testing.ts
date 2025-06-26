import fc from 'fast-check';
import { type FastifyInstance } from 'fastify';

/**
 * Model-based testing framework for stateful API systems
 *
 * This framework allows testing sequences of operations against an API
 * while maintaining invariants and checking consistency across state transitions.
 */

export interface ApiCommand<TState, TResult = unknown> {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string | ((state: TState) => string);
  payload?: unknown | ((state: TState) => unknown);
  headers?:
    | Record<string, string>
    | ((state: TState) => Record<string, string>);
  precondition?: (state: TState) => boolean;
  postcondition?: (
    state: TState,
    result: TResult,
    response: ApiResponse
  ) => boolean;
  transform: (state: TState, result: TResult, response: ApiResponse) => TState;
}

export interface ApiResponse {
  statusCode: number;
  payload: unknown;
  headers: Record<string, string>;
}

export interface ModelState {
  [key: string]: unknown;
}

export interface ModelInvariant<TState> {
  name: string;
  check: (state: TState) => boolean;
  description: string;
}

/**
 * Base class for model-based testing of APIs
 */
export abstract class ApiModelTest<TState extends ModelState> {
  protected app: FastifyInstance;
  protected invariants: ModelInvariant<TState>[] = [];

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  /**
   * Get the initial state of the model
   */
  abstract getInitialState(): TState;

  /**
   * Reset the API state (optional hook for stateful APIs)
   */
  async resetApiState(): Promise<void> {
    // Default implementation does nothing
    // Override in subclasses to reset API state
  }

  /**
   * Get the available commands for the current state
   */
  abstract getCommands(state: TState): ApiCommand<TState>[];

  /**
   * Add an invariant that must hold for all states
   */
  addInvariant(invariant: ModelInvariant<TState>): void {
    this.invariants.push(invariant);
  }

  /**
   * Check all invariants against the current state
   */
  checkInvariants(state: TState): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const invariant of this.invariants) {
      try {
        if (!invariant.check(state)) {
          violations.push(
            `Invariant violation: ${invariant.name} - ${invariant.description}`
          );
        }
      } catch (error) {
        violations.push(
          `Invariant error: ${invariant.name} - ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Execute a command against the API
   */
  async executeCommand<TResult = unknown>(
    command: ApiCommand<TState, TResult>,
    state: TState
  ): Promise<{ response: ApiResponse; newState: TState }> {
    // Resolve dynamic values
    const path =
      typeof command.path === 'function' ? command.path(state) : command.path;
    const payload =
      typeof command.payload === 'function'
        ? command.payload(state)
        : command.payload;
    const headers =
      typeof command.headers === 'function'
        ? command.headers(state)
        : command.headers;

    // Execute the API request
    const injectOptions: any = {
      method: command.method,
      url: path,
    };

    if (payload !== undefined) {
      injectOptions.payload = payload;
    }

    if (headers !== undefined) {
      injectOptions.headers = headers;
    }

    const response = await this.app.inject(injectOptions);

    const apiResponse: ApiResponse = {
      statusCode: response.statusCode,
      payload: response.json(),
      headers: response.headers as Record<string, string>,
    };

    // Transform state based on the result
    const result = apiResponse.payload as TResult;
    const newState = command.transform(state, result, apiResponse);

    return { response: apiResponse, newState };
  }

  /**
   * Generate a property-based test for command sequences
   */
  createSequenceTest(maxCommands: number = 10) {
    return fc.asyncProperty(
      fc.array(fc.nat(), { maxLength: maxCommands }),
      async commandIndices => {
        // Reset API state before each sequence
        await this.resetApiState();
        let currentState = this.getInitialState();

        // Check initial invariants
        const initialCheck = this.checkInvariants(currentState);
        if (!initialCheck.valid) {
          throw new Error(
            `Initial state violates invariants: ${initialCheck.violations.join(', ')}`
          );
        }

        for (const index of commandIndices) {
          const availableCommands = this.getCommands(currentState);

          if (availableCommands.length === 0) {
            break; // No commands available
          }

          const command = availableCommands[index % availableCommands.length];
          if (!command) {
            continue; // Should never happen, but TypeScript safety
          }

          // Check precondition
          if (command.precondition && !command.precondition(currentState)) {
            continue; // Skip command if precondition not met
          }

          try {
            const { response, newState } = await this.executeCommand(
              command,
              currentState
            );

            // Check postcondition
            if (
              command.postcondition &&
              !command.postcondition(currentState, response.payload, response)
            ) {
              throw new Error(
                `Postcondition failed for command: ${command.name}`
              );
            }

            currentState = newState;

            // Check invariants after each command
            const invariantCheck = this.checkInvariants(currentState);
            if (!invariantCheck.valid) {
              throw new Error(
                `Invariants violated after command ${command.name}: ${invariantCheck.violations.join(', ')}`
              );
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            throw new Error(`Command ${command.name} failed: ${errorMessage}`);
          }
        }
      }
    );
  }

  /**
   * Run the model-based test
   */
  async runTest(
    options: { runs?: number; maxCommands?: number } = {}
  ): Promise<void> {
    const { runs = 100, maxCommands = 10 } = options;

    await fc.assert(this.createSequenceTest(maxCommands), {
      numRuns: runs,
      verbose: true,
    });
  }
}

/**
 * Utility functions for common command patterns
 */
export class CommandBuilders {
  /**
   * Create a GET command
   */
  static get<TState extends ModelState, TResult = unknown>(
    name: string,
    path: string | ((state: TState) => string),
    options: Partial<ApiCommand<TState, TResult>> = {}
  ): ApiCommand<TState, TResult> {
    return {
      name,
      method: 'GET',
      path,
      transform: options.transform || (state => state), // Default: no state change
      ...options,
    };
  }

  /**
   * Create a POST command
   */
  static post<TState extends ModelState, TResult = unknown>(
    name: string,
    path: string | ((state: TState) => string),
    payload: unknown | ((state: TState) => unknown),
    transform: (
      state: TState,
      result: TResult,
      response: ApiResponse
    ) => TState,
    options: Partial<ApiCommand<TState, TResult>> = {}
  ): ApiCommand<TState, TResult> {
    return {
      name,
      method: 'POST',
      path,
      payload,
      transform,
      ...options,
    };
  }

  /**
   * Create a PUT command
   */
  static put<TState extends ModelState, TResult = unknown>(
    name: string,
    path: string | ((state: TState) => string),
    payload: unknown | ((state: TState) => unknown),
    transform: (
      state: TState,
      result: TResult,
      response: ApiResponse
    ) => TState,
    options: Partial<ApiCommand<TState, TResult>> = {}
  ): ApiCommand<TState, TResult> {
    return {
      name,
      method: 'PUT',
      path,
      payload,
      transform,
      ...options,
    };
  }

  /**
   * Create a DELETE command
   */
  static delete<TState extends ModelState, TResult = unknown>(
    name: string,
    path: string | ((state: TState) => string),
    transform: (
      state: TState,
      result: TResult,
      response: ApiResponse
    ) => TState,
    options: Partial<ApiCommand<TState, TResult>> = {}
  ): ApiCommand<TState, TResult> {
    return {
      name,
      method: 'DELETE',
      path,
      transform,
      ...options,
    };
  }
}

/**
 * Common invariants for API testing
 */
export class CommonInvariants {
  /**
   * Ensure a collection never has negative count
   */
  static nonNegativeCount<TState extends { count?: number }>(
    name: string = 'Non-negative count'
  ): ModelInvariant<TState> {
    return {
      name,
      description: 'Count should never be negative',
      check: state => (state.count ?? 0) >= 0,
    };
  }

  /**
   * Ensure collections stay within bounds
   */
  static boundedCollection<TState extends { items?: unknown[] }>(
    maxSize: number,
    name: string = 'Bounded collection'
  ): ModelInvariant<TState> {
    return {
      name,
      description: `Collection should not exceed ${maxSize} items`,
      check: state => (state.items?.length ?? 0) <= maxSize,
    };
  }

  /**
   * Ensure required fields are always present
   */
  static requiredFields<TState extends ModelState>(
    fields: (keyof TState)[],
    name: string = 'Required fields present'
  ): ModelInvariant<TState> {
    return {
      name,
      description: `Fields ${fields.join(', ')} must be present`,
      check: state =>
        fields.every(
          field => state[field] !== undefined && state[field] !== null
        ),
    };
  }

  /**
   * Ensure data consistency between related fields
   */
  static dataConsistency<TState extends ModelState>(
    name: string,
    description: string,
    check: (state: TState) => boolean
  ): ModelInvariant<TState> {
    return {
      name,
      description,
      check,
    };
  }
}

/**
 * Fast-check arbitraries for common API data types
 */
export class ApiArbitraries {
  /**
   * Generate valid HTTP status codes
   */
  static statusCode(): fc.Arbitrary<number> {
    return fc.oneof(
      fc.constantFrom(200, 201, 204), // Success codes
      fc.constantFrom(400, 401, 403, 404, 422), // Client error codes
      fc.constantFrom(500, 502, 503) // Server error codes
    );
  }

  /**
   * Generate realistic API request payloads
   */
  static apiPayload(): fc.Arbitrary<Record<string, unknown>> {
    return fc.record({
      id: fc.option(fc.string()),
      name: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
      email: fc.option(fc.emailAddress()),
      timestamp: fc.option(fc.date().map(d => d.toISOString())),
      active: fc.option(fc.boolean()),
    });
  }

  /**
   * Generate sequences of API operations
   */
  static commandSequence<T>(commands: T[]): fc.Arbitrary<T[]> {
    return fc.array(fc.constantFrom(...commands), {
      minLength: 1,
      maxLength: 20,
    });
  }
}
