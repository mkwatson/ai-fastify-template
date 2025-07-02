import fastifyRateLimit, {
  type RateLimitPluginOptions,
} from '@fastify/rate-limit';
import fp from 'fastify-plugin';

export default fp(
  async fastify => {
    if (!fastify.config) {
      throw new Error(
        'Configuration plugin must be registered before rate-limit plugin'
      );
    }

    const rateLimitOptions: RateLimitPluginOptions = {
      max: fastify.config.RATE_LIMIT_MAX,
      timeWindow: fastify.config.RATE_LIMIT_TIME_WINDOW,
      errorResponseBuilder: (_request, context) => {
        return {
          error: 'RateLimitExceeded',
          message: `You have exceeded the allowed number of requests. Try again in ${context.after}.`,
          statusCode: 429,
        };
      },
      hook: 'onRequest',
      keyGenerator: request => {
        // Use X-Forwarded-For header if present (for proxied requests), otherwise use remoteAddress
        return (
          request.headers['x-forwarded-for']
            ?.toString()
            .split(',')[0]
            ?.trim() ??
          request.ip ??
          'anonymous'
        );
      },
    };

    await fastify.register(fastifyRateLimit, rateLimitOptions);

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
