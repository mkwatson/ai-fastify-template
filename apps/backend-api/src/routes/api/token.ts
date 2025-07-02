import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const TokenResponseSchema = z.object({
  token: z.string().describe('JWT token for API authentication'),
  expiresIn: z.number().describe('Token expiration time in seconds'),
});

type TokenResponse = z.infer<typeof TokenResponseSchema>;

const ErrorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'string',
      description: 'Error type',
    },
    message: {
      type: 'string',
      description: 'Error message',
    },
    statusCode: {
      type: 'number',
      description: 'HTTP status code',
    },
  },
  required: ['error', 'message', 'statusCode'],
} as const;

const tokenRoute: FastifyPluginAsync = async (
  fastify,
  _opts
): Promise<void> => {
  fastify.post(
    '/token',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Generate authentication token',
        description:
          'Issues a JWT token for API authentication. Validates request origin against allowed origins.',
        headers: {
          type: 'object',
          properties: {
            origin: {
              type: 'string',
              description: 'Request origin for CORS validation',
            },
          },
        },
        response: {
          200: {
            description: 'Token generated successfully',
            type: 'object',
            properties: {
              token: {
                type: 'string',
                description: 'JWT token for API authentication',
              },
              expiresIn: {
                type: 'number',
                description: 'Token expiration time in seconds',
              },
            },
            required: ['token', 'expiresIn'],
          },
          403: {
            description: 'Origin not allowed',
            ...ErrorResponseSchema,
          },
          429: {
            description: 'Rate limit exceeded',
            ...ErrorResponseSchema,
          },
          500: {
            description: 'Internal server error',
            ...ErrorResponseSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const origin = request.headers.origin;

      if (!origin) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Origin header is required',
          statusCode: 403,
        });
      }

      const allowedOrigins = fastify.config?.ALLOWED_ORIGIN ?? [];
      const isAllowedOrigin = allowedOrigins.some(
        allowed => allowed.toLowerCase() === origin.toLowerCase()
      );

      if (!isAllowedOrigin) {
        fastify.log.warn(
          { origin, allowedOrigins },
          'Token request from unauthorized origin'
        );
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Origin not allowed',
          statusCode: 403,
        });
      }

      const payload = {};
      const token = fastify.jwt.sign(payload);
      const expiresIn = 900; // 15 minutes in seconds

      const response: TokenResponse = {
        token,
        expiresIn,
      };

      if (fastify.config?.NODE_ENV === 'development') {
        TokenResponseSchema.parse(response);
      }

      fastify.log.info({ origin }, 'Token generated successfully');
      return response;
    }
  );
};

export default tokenRoute;
