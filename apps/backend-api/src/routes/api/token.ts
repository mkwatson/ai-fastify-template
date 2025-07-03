import type { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import {
  extractFingerprint,
  trackFingerprint,
  isOriginSuspicious,
} from '../../services/fingerprint.js';

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
          max: 10,
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
        throw fastify.httpErrors.forbidden(
          'The request origin is not in the allowed list'
        );
      }

      // Extract and track request fingerprint
      const fingerprint = extractFingerprint(request);
      trackFingerprint(origin, fingerprint);

      // Check for suspicious activity patterns
      if (isOriginSuspicious(origin)) {
        fastify.log.warn(
          { origin, fingerprint },
          'Suspicious origin activity detected'
        );
        throw fastify.httpErrors.tooManyRequests(
          'Unusual activity detected. Please try again later.'
        );
      }

      // Generate token with standard claims
      const sessionId = randomUUID();
      const token = fastify.jwt.sign({
        sub: sessionId, // Subject: unique session identifier
        aud: 'api', // Audience: this API
        type: 'access', // Token type for future refresh token support
      });

      // Log token issuance for monitoring
      fastify.log.info(
        {
          event: 'token_issued',
          sessionId,
          origin,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        'JWT token issued'
      );

      return {
        token,
        tokenType: 'Bearer' as const,
        expiresIn: 900,
      };
    }
  );
};

export default tokenRoute;
