import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// Response schemas
const ExampleResponseSchema = z.string().describe('Example response message');

// Error response schemas for OpenAPI
const ErrorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'string',
      description: 'Error type',
      example: 'Bad Request',
    },
    message: {
      type: 'string',
      description: 'Error message',
      example: 'Invalid request parameters',
    },
    statusCode: {
      type: 'number',
      description: 'HTTP status code',
      example: 400,
    },
  },
  required: ['error', 'message', 'statusCode'],
} as const;

const example: FastifyPluginAsync =
  // eslint-disable-next-line require-await
  async (fastify, _opts): Promise<void> => {
    fastify.get(
      '/',
      {
        schema: {
          tags: ['Example'],
          summary: 'Get example message',
          description: 'Returns an example string response',
          response: {
            200: {
              description: 'Successful response',
              type: 'string',
              example: 'this is an example',
            },
            500: {
              description: 'Internal Server Error',
              ...ErrorResponseSchema,
            },
          },
        },
      },
      // eslint-disable-next-line require-await
      async (_request, reply) => {
        const response = 'this is an example';

        // Validate response against schema in development
        if (fastify.config?.NODE_ENV === 'development') {
          ExampleResponseSchema.parse(response);
        }

        // Ensure JSON response for consistency with OpenAPI spec
        reply.type('application/json');
        reply.send(JSON.stringify(response));
      }
    );
  };

export default example;
