/**
 * Server configuration utilities for Fastify applications
 */

export const DEFAULT_PORT = 3000; // Standard HTTP port

/**
 * Gets the server port from environment or default
 * @returns The port number to use
 */
export function getPort(): number {
  const envPort = process.env['PORT'];
  if (!envPort) return DEFAULT_PORT;

  const port = parseInt(envPort, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(
      `Invalid PORT value: ${envPort}. Must be a number between 1-65535.`
    );
  }

  return port;
}
