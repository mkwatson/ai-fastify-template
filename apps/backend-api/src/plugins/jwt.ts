import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId?: string;
  iat: number;
  exp: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    jwt: {
      sign: (payload: object) => string;
      verify: (token: string) => JWTPayload;
    };
  }
  interface FastifyRequest {
    jwt?: JWTPayload;
  }
}

export default fp(
  async fastify => {
    const secret = fastify.config?.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const sign = (payload: object): string => {
      return jwt.sign(payload, secret, {
        expiresIn: '15m',
        algorithm: 'HS256',
      });
    };

    const verify = (token: string): JWTPayload => {
      try {
        const decoded = jwt.verify(token, secret, {
          algorithms: ['HS256'],
        });

        if (typeof decoded === 'string') {
          throw new Error('Invalid token payload format');
        }

        return decoded as JWTPayload;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          const err = new Error('Token expired');
          (err as Error & { statusCode: number }).statusCode = 401;
          throw err;
        }
        if (error instanceof jwt.JsonWebTokenError) {
          const err = new Error('Invalid token');
          (err as Error & { statusCode: number }).statusCode = 401;
          throw err;
        }
        throw error;
      }
    };

    fastify.decorate('jwt', {
      sign,
      verify,
    });

    fastify.log.info('JWT plugin registered successfully');
  },
  {
    name: 'jwt-plugin',
    dependencies: ['env-plugin'],
  }
);
