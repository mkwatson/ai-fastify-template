import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

const authenticatePlugin: FastifyPluginAsync = async fastify => {
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();

        // Additional validation could go here
        // For example, checking if token type is 'access'
        const token = request.user as { type?: string };
        if (!token || token.type !== 'access') {
          throw new Error('Invalid token type');
        }
      } catch (err) {
        reply.send(err);
      }
    }
  );
};

export default fp(authenticatePlugin, {
  name: 'authenticate',
});
