import type { FastifyPluginAsync } from 'fastify';

const example: FastifyPluginAsync =
  // eslint-disable-next-line require-await
  async (fastify, _opts): Promise<void> => {
    fastify.get(
      '/',
      // eslint-disable-next-line require-await
      async (_request, _reply) => 'this is an example'
    );
  };

export default example;
