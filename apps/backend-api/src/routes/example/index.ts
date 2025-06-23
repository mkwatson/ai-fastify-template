import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// Response schemas
const ExampleResponseSchema = z.string().describe('Example response message');

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
          },
        },
      },
      // eslint-disable-next-line require-await
      async (_request, _reply) => {
        const response = 'this is an example';

        // Validate response against schema in development
        if (fastify.config?.NODE_ENV === 'development') {
          ExampleResponseSchema.parse(response);
        }

        return response;
      }
    );
  };

export default example;
