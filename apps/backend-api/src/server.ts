import Fastify from 'fastify';

import app from './app.js';

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  },
});

server.register(app);

const start = async (): Promise<void> => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info('Server listening on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    throw new Error('Failed to start server');
  }
};

start();
