import fastifyCors, { type FastifyCorsOptions } from '@fastify/cors';
import fp from 'fastify-plugin';

export default fp(
  async fastify => {
    if (!fastify.config) {
      throw new Error(
        'Configuration plugin must be registered before CORS plugin'
      );
    }

    const corsOptions: FastifyCorsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., same-origin requests, Postman, curl)
        if (!origin) {
          callback(null, true);
          return;
        }

        // Check if the origin is in our allowed list
        const isAllowed =
          fastify.config?.ALLOWED_ORIGIN.includes(origin) ?? false;

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
      maxAge: 86400, // 24 hours
    };

    await fastify.register(fastifyCors, corsOptions);

    fastify.log.info(
      {
        allowedOrigins: fastify.config.ALLOWED_ORIGIN,
        credentials: true,
      },
      'CORS configured'
    );
  },
  {
    name: 'cors-plugin',
    dependencies: ['env-plugin'],
  }
);
