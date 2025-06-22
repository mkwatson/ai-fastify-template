/**
 * Environment detection utilities
 */

export type Environment = 'development' | 'production' | 'test';

/**
 * Gets the current environment
 * @returns The current environment
 */
export function getEnvironment(): Environment {
  const env = process.env['NODE_ENV'];

  if (env === 'production' || env === 'test') {
    return env;
  }

  return 'development';
}

/**
 * Checks if we're in development mode
 * @returns True if in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Checks if we're in production mode
 * @returns True if in production
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}
