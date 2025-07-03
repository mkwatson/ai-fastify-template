import { getPort, isDevelopment } from '@ai-fastify-template/config';
import Fastify from 'fastify';

import app from './app.js';
import {
  startFingerprintCleanup,
  stopFingerprintCleanup,
} from './services/fingerprint.js';

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

    await server.listen({ port });
    server.log.info(`Server listening on port ${String(port)}`);

    // Start fingerprint cleanup after server is running
    startFingerprintCleanup();
    server.log.info('Fingerprint cleanup task started');
  } catch (err) {
    server.log.error(err);
    throw new Error('Failed to start server');
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (): Promise<void> => {
  server.log.info('Received shutdown signal, closing server gracefully...');

  // Stop fingerprint cleanup
  stopFingerprintCleanup();

  // Close server
  await server.close();
  server.log.info('Server closed successfully');
  process.exit(0);
};

// Register shutdown handlers
process.on('SIGTERM', () => {
  void gracefulShutdown();
});
process.on('SIGINT', () => {
  void gracefulShutdown();
});

start().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
