import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// Response schemas
const HelloWorldResponseSchema = z.object({
  message: z.string().describe('Welcome message'),
});

const root: FastifyPluginAsync =
  // eslint-disable-next-line require-await
  async (fastify, _opts): Promise<void> => {
    fastify.get(
      '/',
      {
        schema: {
          tags: ['Root'],
          summary: 'Get welcome message',
          description: 'Returns a hello world message for API health check',
          response: {
            200: {
              description: 'Successful response',
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Welcome message',
                  example: 'Hello World!',
                },
              },
              required: ['message'],
            },
          },
        },
      },
      // eslint-disable-next-line require-await
      async (_request, _reply) => {
        const response = { message: 'Hello World!' };

        // Validate response against schema in development
        if (fastify.config?.NODE_ENV === 'development') {
          HelloWorldResponseSchema.parse(response);
        }

        return response;
      }
    );
  };

export default root;
