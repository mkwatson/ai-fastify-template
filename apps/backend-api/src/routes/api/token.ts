import type { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import {
  extractFingerprint,
  trackOriginRequest,
  isOriginSuspicious,
} from '../../services/fingerprint.js';
import type { JWTPayload } from '../../types/jwt.js';

// Token route will use allowed origins from config

const tokenRoute: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Create allowed origins Set from config
  const allowedOrigins = new Set(
    fastify.config?.ALLOWED_ORIGIN || ['http://localhost:3000']
  );

  fastify.post(
    '/token',
    {
      config: {
        rateLimit: {
          max: 3, // Match Linear spec: 3 requests/minute
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['Authentication'],
        summary: 'Generate authentication token',
        description:
          'Issues a JWT token for API authentication. Validates request origin against allowed origins.',
        headers: {
          type: 'object',
          required: ['origin'],
          properties: {
            origin: {
              type: 'string',
              description: 'Request origin for validation (required)',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              tokenType: { type: 'string', enum: ['Bearer'] },
              expiresIn: { type: 'number' },
            },
          },
          403: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
            },
          },
        },
      },
    },
    async request => {
      const { origin } = request.headers;

      // Validate origin
      if (origin === undefined) {
        throw fastify.httpErrors.badRequest('Origin header is required');
      }

      if (!origin || origin.trim() === '') {
        throw fastify.httpErrors.forbidden('Origin header is required');
      }

      if (!allowedOrigins.has(origin)) {
        // Provide helpful error in development
        const isDev = fastify.config?.NODE_ENV === 'development';
        const message = isDev
          ? `Origin '${origin}' is not allowed. Allowed origins: ${Array.from(
              allowedOrigins
            ).join(', ')}`
          : 'The request origin is not in the allowed list';

        throw fastify.httpErrors.forbidden(message);
      }

      // Track request for abuse detection
      trackOriginRequest(origin);

      // Check for suspicious activity patterns
      if (isOriginSuspicious(origin)) {
        fastify.log.warn(
          { origin, ip: request.ip },
          'Suspicious origin activity detected'
        );
        throw fastify.httpErrors.tooManyRequests(
          'Unusual activity detected. Please try again later.'
        );
      }

      // Extract fingerprint for token payload
      const fingerprintHash = extractFingerprint(request);

      // Generate token with enhanced claims
      const sessionId = randomUUID();
      const expiresIn = 900 + Math.floor(Math.random() * 60); // 15-16 minutes with jitter

      const token = fastify.jwt.sign(
        {
          sub: sessionId, // Subject: unique session identifier
          aud: 'api', // Audience: this API
          type: 'access', // Token type for future refresh token support
          origin, // Track issuing origin
          fingerprint: fingerprintHash, // One-way hash for abuse tracking
        },
        {
          expiresIn: `${expiresIn}s`,
          iss: 'airbolt-api', // Include issuer claim
        }
      );

      // Log token issuance for monitoring
      fastify.log.info(
        {
          event: 'token_issued',
          sessionId,
          origin,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          expiresIn,
        },
        'JWT token issued'
      );

      return {
        token,
        tokenType: 'Bearer' as const,
        expiresIn,
      };
    }
  );

  // Token introspection endpoint for debugging
  fastify.get(
    '/token/verify',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Authentication'],
        summary: 'Verify and introspect token',
        description:
          'Validates the current token and returns decoded claims. Useful for debugging authentication issues.',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              expires: { type: 'number' },
              remaining: { type: 'number' },
              claims: {
                type: 'object',
                properties: {
                  sub: { type: 'string' },
                  aud: { type: 'string' },
                  type: { type: 'string' },
                  origin: { type: 'string' },
                  fingerprint: { type: 'string' },
                  iat: { type: 'number' },
                  exp: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async request => {
      const now = Math.floor(Date.now() / 1000);
      const user = request.user as JWTPayload;
      const expires = user.exp || 0;

      return {
        valid: true,
        expires,
        remaining: Math.max(0, expires - now),
        claims: user,
      };
    }
  );
};

export default tokenRoute;
