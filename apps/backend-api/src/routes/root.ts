import type { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync =
  // eslint-disable-next-line require-await
  async (fastify, _opts): Promise<void> => {
    fastify.get(
      '/',
      // eslint-disable-next-line require-await
      async (_request, _reply) => ({ message: 'Hello World!' })
    );
  };

export default root;
