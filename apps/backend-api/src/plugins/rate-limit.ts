import fastifyRateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';

export default fp(
  async fastify => {
    if (!fastify.config) {
      throw new Error(
        'Configuration plugin must be registered before rate-limit plugin'
      );
    }

    await fastify.register(fastifyRateLimit, {
      max: fastify.config.RATE_LIMIT_MAX,
      timeWindow: fastify.config.RATE_LIMIT_TIME_WINDOW,
      errorResponseBuilder: (_request, context) => {
        return {
          error: 'RateLimitExceeded',
          message: `You have exceeded the allowed number of requests. Try again in ${context.after}.`,
          statusCode: 429,
        };
      },
      keyGenerator: request => {
        // Use IP address as the key for rate limiting
        return request.ip ?? 'anonymous';
      },
    });

    fastify.log.info(
      {
        max: fastify.config.RATE_LIMIT_MAX,
        timeWindow: `${fastify.config.RATE_LIMIT_TIME_WINDOW}ms`,
      },
      'Rate limiting configured'
    );
  },
  {
    name: 'rate-limit-plugin',
    dependencies: ['env-plugin'],
  }
);
