import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { OriginValidator } from '../../utils/origin-validator.js';

// Response schemas
const TokenResponseSchema = z.object({
  token: z.string().describe('JWT token for API authentication'),
  tokenType: z.literal('Bearer').describe('Token type for Authorization header'),
  expiresIn: z.number().describe('Token expiration time in seconds'),
});

const ErrorResponseSchema = z.object({
  error: z.string().describe('Error code'),
  message: z.string().describe('Human-readable error message'),
  statusCode: z.number().describe('HTTP status code'),
  retryAfter: z.string().optional().describe('When to retry (for rate limits)'),
});

// Types
type TokenResponse = z.infer<typeof TokenResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

const tokenRoute: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Initialize origin validator at startup
  const originValidator = new OriginValidator(fastify.config?.ALLOWED_ORIGIN ?? []);
  
  // Warn if wildcard is enabled in production
  if (originValidator.isWildcardEnabled() && fastify.config?.NODE_ENV === 'production') {
    fastify.log.warn('Origin wildcard (*) is enabled in production - this is a security risk!');
  }

  fastify.post(
    '/token',
    {
      // Apply stricter rate limiting for token generation
      config: {
        rateLimit: fastify.rateLimiters.tokenGeneration,
      },
      schema: {
        tags: ['Authentication'],
        summary: 'Generate authentication token',
        description: 'Issues a JWT token for API authentication. Validates request origin against allowed origins.',
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
            description: 'Token generated successfully',
            type: 'object',
            properties: {
              token: { type: 'string' },
              tokenType: { type: 'string', enum: ['Bearer'] },
              expiresIn: { type: 'number' },
            },
            required: ['token', 'tokenType', 'expiresIn'],
          },
          403: {
            description: 'Origin not allowed or missing',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
              retryAfter: { type: 'string' },
            },
            required: ['error', 'message', 'statusCode'],
          },
          429: {
            description: 'Rate limit exceeded',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
              retryAfter: { type: 'string' },
            },
            required: ['error', 'message', 'statusCode'],
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
              retryAfter: { type: 'string' },
            },
            required: ['error', 'message', 'statusCode'],
          },
        },
      },
    },
    async (request, reply) => {
      const origin = request.headers.origin;

      // Validate origin
      if (!originValidator.isAllowed(origin)) {
        const errorResponse: ErrorResponse = {
          error: 'ORIGIN_NOT_ALLOWED',
          message: origin 
            ? 'The request origin is not in the allowed list' 
            : 'Origin header is required',
          statusCode: 403,
        };

        // Log security event
        fastify.log.warn(
          { 
            origin: origin || 'missing',
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          },
          'Token request from unauthorized origin'
        );

        return reply.code(403).send(errorResponse);
      }

      try {
        // Generate token with proper claims
        const token = await fastify.generateToken({
          type: 'api_access',
          audience: origin!,
          metadata: {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          },
        });

        const response: TokenResponse = {
          token,
          tokenType: 'Bearer',
          expiresIn: 900, // 15 minutes
        };

        // Log successful token generation
        fastify.log.info(
          {
            origin,
            ip: request.ip,
            tokenType: 'api_access',
          },
          'Token generated successfully'
        );

        // Set security headers
        reply
          .header('Cache-Control', 'no-store, no-cache, must-revalidate')
          .header('Pragma', 'no-cache')
          .send(response);
      } catch (error) {
        // Log token generation failure
        fastify.log.error(
          {
            error,
            origin,
            ip: request.ip,
          },
          'Failed to generate token'
        );

        const errorResponse: ErrorResponse = {
          error: 'TOKEN_GENERATION_FAILED',
          message: 'Unable to generate authentication token',
          statusCode: 500,
        };

        reply.code(500).send(errorResponse);
      }
    }
  );
};

export default tokenRoute;