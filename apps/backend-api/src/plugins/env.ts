import fp from 'fastify-plugin';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  HOST: z.string().default('localhost'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}

export default fp(async (fastify) => {
  try {
    const config = EnvSchema.parse(process.env);
    fastify.decorate('config', config);
    fastify.log.info({ config }, 'Environment configuration loaded');
  } catch (error) {
    fastify.log.error({ error }, 'Invalid environment configuration');
    throw error;
  }
}, {
  name: 'env-plugin'
}); 