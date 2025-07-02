import { URL } from 'node:url';

/**
 * Normalizes an origin URL for consistent comparison
 * Handles edge cases like:
 * - Different cases (HTTP vs http)
 * - Default ports (http:80, https:443)
 * - Trailing slashes
 * - URL fragments and paths (removes them)
 */
export function normalizeOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    
    // Only use protocol and host (no path, search, or hash)
    const protocol = url.protocol.toLowerCase();
    const hostname = url.hostname.toLowerCase();
    let port = url.port;
    
    // Normalize default ports
    if (!port) {
      port = protocol === 'https:' ? '443' : '80';
    }
    
    // Remove default ports from final string
    const isDefaultPort = 
      (protocol === 'https:' && port === '443') ||
      (protocol === 'http:' && port === '80');
    
    return isDefaultPort 
      ? `${protocol}//${hostname}`
      : `${protocol}//${hostname}:${port}`;
  } catch (error) {
    // Invalid URL format
    throw new Error(`Invalid origin format: ${origin}`);
  }
}

/**
 * Creates a Set-based origin validator for O(1) lookups
 */
export class OriginValidator {
  private readonly allowedOrigins: Set<string>;
  private readonly allowAll: boolean;

  constructor(origins: string[]) {
    // Special case: empty array means no origins allowed
    if (origins.length === 0) {
      this.allowAll = false;
      this.allowedOrigins = new Set();
      return;
    }

    // Special case: wildcard allows all origins (development only)
    if (origins.includes('*')) {
      this.allowAll = true;
      this.allowedOrigins = new Set();
      return;
    }

    // Normalize all origins for consistent comparison
    this.allowAll = false;
    this.allowedOrigins = new Set(
      origins.map(origin => {
        try {
          return normalizeOrigin(origin);
        } catch (error) {
          throw new Error(`Invalid origin in configuration: ${origin}`);
        }
      })
    );
  }

  /**
   * Validates if an origin is allowed
   */
  isAllowed(origin: string | undefined): boolean {
    if (!origin) {
      return false;
    }

    if (this.allowAll) {
      return true;
    }

    try {
      const normalized = normalizeOrigin(origin);
      return this.allowedOrigins.has(normalized);
    } catch {
      // Invalid origin format
      return false;
    }
  }

  /**
   * Gets the list of allowed origins (for logging/debugging)
   */
  getAllowedOrigins(): string[] {
    return Array.from(this.allowedOrigins);
  }

  /**
   * Checks if wildcard is enabled
   */
  isWildcardEnabled(): boolean {
    return this.allowAll;
  }
}

/**
 * Express/Fastify middleware factory for origin validation
 */
export function createOriginValidationHook(validator: OriginValidator) {
  return (request: { headers: { origin?: string } }, reply: { code?: (code: number) => { send: (payload: unknown) => void } }): void => {
    const origin = request.headers.origin;
    
    if (!validator.isAllowed(origin)) {
      if (reply.code) {
        reply.code(403).send({
          error: 'ORIGIN_NOT_ALLOWED',
          message: 'The request origin is not in the allowed list',
          statusCode: 403,
        });
        throw new Error('Origin not allowed');
      } else {
        throw new Error('Origin not allowed');
      }
    }
  };
}