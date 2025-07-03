import fastifyRateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify';

// Rate limit tiers for different contexts
export const RATE_LIMIT_TIERS = {
  // Global rate limit (per IP)
  global: {
    name: 'global',
    keyGenerator: (request: FastifyRequest) => request.ip || 'anonymous',
  },
  
  // Per-origin rate limit (for token generation)
  origin: {
    name: 'origin',
    keyGenerator: (request: FastifyRequest) => `origin:${request.headers.origin || 'no-origin'}`,
  },
  
  // Per-token rate limit (for authenticated requests)
  token: {
    name: 'token',
    keyGenerator: (request: FastifyRequest) => {
      const auth = request.headers.authorization;
      const token = auth?.startsWith('Bearer ') ? auth.slice(7) : 'no-token';
      // Use first 8 chars of token as key (enough for uniqueness, safe for logging)
      return `token:${token.substring(0, 8)}`;
    },
  },
} as const;

export default fp(
  async (fastify) => {
    if (!fastify.config) {
      throw new Error(
        'Configuration plugin must be registered before rate-limit plugin'
      );
    }

    // Global rate limiting
    await fastify.register(fastifyRateLimit, {
      global: true,
      max: fastify.config.RATE_LIMIT_MAX,
      timeWindow: fastify.config.RATE_LIMIT_TIME_WINDOW,
      keyGenerator: RATE_LIMIT_TIERS.global.keyGenerator,
      errorResponseBuilder: (_request, context) => {
        return {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Please retry after ${context.after}.`,
          statusCode: 429,
          retryAfter: context.after,
        };
      },
      // Hook to run rate limit check
      hook: 'onRequest',
      // Skip rate limiting for health checks
      skipOnError: false,
      // Add rate limit headers
      addHeadersOnExceeding: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
      },
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true,
      },
    });

    // Create route-specific rate limiters
    fastify.decorate('rateLimiters', {
      // Stricter limit for token generation
      tokenGeneration: {
        max: 10,
        timeWindow: '1 minute',
        keyGenerator: RATE_LIMIT_TIERS.origin.keyGenerator,
      },
      
      // Standard API limit
      api: {
        max: fastify.config.RATE_LIMIT_MAX,
        timeWindow: fastify.config.RATE_LIMIT_TIME_WINDOW,
        keyGenerator: RATE_LIMIT_TIERS.global.keyGenerator,
      },
      
      // Lenient limit for authenticated requests
      authenticated: {
        max: 1000,
        timeWindow: '1 minute',
        keyGenerator: RATE_LIMIT_TIERS.token.keyGenerator,
      },
    });

    fastify.log.info(
      {
        global: {
          max: fastify.config.RATE_LIMIT_MAX,
          timeWindow: `${fastify.config.RATE_LIMIT_TIME_WINDOW}ms`,
        },
        tiers: Object.keys(RATE_LIMIT_TIERS),
      },
      'Rate limiting configured with multiple tiers'
    );
  },
  {
    name: 'rate-limit-plugin',
    dependencies: ['env-plugin'],
  }
);

// TypeScript augmentation
declare module 'fastify' {
  interface FastifyInstance {
    rateLimiters: {
      tokenGeneration: {
        max: number;
        timeWindow: string;
        keyGenerator: (request: any) => string;
      };
      api: {
        max: number;
        timeWindow: number;
        keyGenerator: (request: any) => string;
      };
      authenticated: {
        max: number;
        timeWindow: string;
        keyGenerator: (request: any) => string;
      };
    };
  }
}