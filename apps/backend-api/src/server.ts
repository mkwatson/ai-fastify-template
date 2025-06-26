import { getPort, getHost, isDevelopment } from '@ai-fastify-template/config';
import Fastify from 'fastify';

import app from './app.js';

const isDev: boolean = isDevelopment();
const server = Fastify({
  logger: isDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
        },
      }
    : {
        level: 'info',
      },
});

server.register(app);

const start = async (): Promise<void> => {
  try {
    const port: number = getPort();
    const host: string = getHost();

    await server.listen({ port, host });
    server.log.info(`Server listening on http://${host}:${String(port)}`);
  } catch (err) {
    server.log.error(err);
    throw new Error('Failed to start server');
  }
};

start().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
