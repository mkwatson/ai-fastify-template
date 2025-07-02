import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import crypto from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  JWTPayloadSchema,
  JWT_CONFIG,
  JWT_ERROR_CODES,
  type GenerateTokenOptions,
  type JWTPayload,
} from '../types/jwt.js';

export default fp(
  async fastify => {
    const secret = fastify.config?.JWT_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be configured with at least 32 characters'
      );
    }

    // Register the official Fastify JWT plugin
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await fastify.register(fastifyJwt as any, {
      secret,
      sign: {
        algorithm: JWT_CONFIG.ALGORITHM,
        issuer: 'airbolt-api',
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
      },
      verify: {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: 'airbolt-api',
        clockTolerance: JWT_CONFIG.CLOCK_TOLERANCE,
      },
      decode: {
        complete: true,
      },
      messages: {
        badRequestErrorMessage: 'Invalid token format',
        noAuthorizationInHeaderMessage: 'Authorization header is missing',
        authorizationTokenExpiredMessage: 'Token has expired',
        authorizationTokenInvalid: 'Token is invalid',
      },
    });

    // Add helper methods to existing jwt object
    const originalSign = fastify.jwt.sign.bind(fastify.jwt);
    const originalVerify = fastify.jwt.verify.bind(fastify.jwt);

    // Override sign to ensure our defaults
    fastify.jwt.sign = (payload: object, options?: any): string => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return originalSign(payload, options);
    };

    // Override verify to provide better error handling
    fastify.jwt.verify = (token: string, options?: any): JWTPayload => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const decoded = originalVerify(token, options) as JWTPayload;
        return decoded;
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.code === 'FAST_JWT_EXPIRED') {
          const err = new Error('Token expired');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (err as any).statusCode = 401;
          throw err;
        }
        if (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          error.code === 'FAST_JWT_INVALID' ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          error.code === 'FAST_JWT_MALFORMED'
        ) {
          const err = new Error('Invalid token');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (err as any).statusCode = 401;
          throw err;
        }
        throw error;
      }
    };

    // Enhanced token generation with proper claims
    fastify.decorate(
      'generateToken',
      async function (options: GenerateTokenOptions) {
        const now = Math.floor(Date.now() / 1000);

        // Determine expiry based on token type
        const expiryMap: Record<string, string> = {
          api_access: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
          refresh: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
          service: JWT_CONFIG.SERVICE_TOKEN_EXPIRY,
        };

        const payload = {
          // Standard claims
          iss: 'airbolt-api',
          aud: options.audience,
          jti: crypto.randomUUID(),
          iat: now,

          // Custom claims
          type: options.type,
          version: 1,

          // Optional claims
          ...(options.subject && { sub: options.subject }),
          ...(options.scope && { scope: options.scope }),
          ...(options.metadata && { metadata: options.metadata }),
        };

        // Validate payload structure
        const validated = JWTPayloadSchema.omit({ exp: true }).parse(payload);

        const expiresIn = expiryMap[options.type];
        if (!expiresIn) {
          throw new Error(`Invalid token type: ${options.type}`);
        }

        return fastify.jwt.sign(validated, {
          expiresIn,
        });
      }
    );

    // Strict authentication (requires valid token)
    fastify.decorate(
      'authenticate',
      async function (request: FastifyRequest, _reply: FastifyReply) {
        try {
          const payload = await request.jwtVerify();

          // Additional validation beyond signature
          const validated = JWTPayloadSchema.parse(payload);

          // Verify audience matches current request origin if present
          const origin = request.headers.origin;
          if (origin && validated.aud !== origin) {
            throw fastify.httpErrors.forbidden(
              'Token audience does not match request origin'
            );
          }

          // Attach validated payload to request
          request.jwt = validated;
        } catch (error) {
          // Transform JWT errors to consistent format

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if ((error as any).code === 'FAST_JWT_EXPIRED') {
            throw fastify.httpErrors.unauthorized('Token has expired', {
              code: JWT_ERROR_CODES.TOKEN_EXPIRED,
            });
          }

          if (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (error as any).code === 'FAST_JWT_INVALID' ||
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (error as any).code === 'FAST_JWT_MALFORMED'
          ) {
            throw fastify.httpErrors.unauthorized('Invalid token', {
              code: JWT_ERROR_CODES.INVALID_TOKEN,
            });
          }

          // Re-throw Fastify HTTP errors
          if ('statusCode' in (error as Error)) {
            throw error;
          }

          // Log unexpected errors
          fastify.log.error({ error }, 'Unexpected JWT verification error');
          throw fastify.httpErrors.unauthorized('Authentication failed');
        }
      }
    );

    // Optional authentication (validates token if present)
    fastify.decorate(
      'authenticateOptional',
      async function (request: FastifyRequest, reply: FastifyReply) {
        const auth = request.headers.authorization;

        if (!auth || !auth.startsWith('Bearer ')) {
          // No token provided, continue without authentication
          return;
        }

        // Token provided, must be valid
        await fastify.authenticate(request, reply);
      }
    );

    // Helper to extract token from various sources
    fastify.decorateRequest('extractToken', function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const request = this;

      // Check Authorization header
      const auth = request.headers.authorization;
      if (auth?.startsWith('Bearer ')) {
        return auth.slice(7);
      }

      // Check cookie (if cookie plugin is registered)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ('cookies' in request && (request as any).cookies?.token) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return (request as any).cookies.token as string;
      }

      // Check query parameter (for download links, etc.)
      if (
        request.query &&
        typeof request.query === 'object' &&
        'token' in request.query
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return (request.query as any).token as string;
      }

      return null;
    });

    fastify.log.info('JWT plugin registered with enhanced security');
  },
  {
    name: 'jwt-plugin',
    dependencies: ['env-plugin'],
  }
);

// TypeScript augmentation
declare module 'fastify' {
  interface FastifyInstance {
    generateToken: (options: GenerateTokenOptions) => Promise<string>;
  }

  interface FastifyRequest {
    extractToken: () => string | null;
  }
}
