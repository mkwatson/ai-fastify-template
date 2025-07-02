import { z } from 'zod';

// JWT Token Types
export const JWT_TOKEN_TYPES = {
  API_ACCESS: 'api_access',
  REFRESH: 'refresh',
  SERVICE: 'service',
} as const;

// JWT Payload Schema - Single source of truth
export const JWTPayloadSchema = z.object({
  // Standard JWT Claims
  iss: z.literal('airbolt-api').describe('Token issuer'),
  aud: z.string().url().describe('Intended audience (origin)'),
  jti: z.string().uuid().describe('Unique token identifier'),
  iat: z.number().describe('Issued at timestamp'),
  exp: z.number().describe('Expiration timestamp'),
  
  // Custom Claims
  type: z.enum([JWT_TOKEN_TYPES.API_ACCESS, JWT_TOKEN_TYPES.REFRESH, JWT_TOKEN_TYPES.SERVICE])
    .describe('Token type for different use cases'),
  version: z.literal(1).describe('Payload version for future migrations'),
  
  // Optional Claims
  sub: z.string().optional().describe('Subject (user/service ID)'),
  scope: z.array(z.string()).optional().describe('Granted permissions'),
  metadata: z.record(z.unknown()).optional().describe('Additional context'),
});

// TypeScript types derived from Zod
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type JWTTokenType = keyof typeof JWT_TOKEN_TYPES;

// Token configuration
export const JWT_CONFIG = {
  ALGORITHM: 'HS256' as const,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  SERVICE_TOKEN_EXPIRY: '1y',
  CLOCK_TOLERANCE: 30, // seconds
} as const;

// Error codes for consistent error handling
export const JWT_ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_NOT_ACTIVE: 'TOKEN_NOT_ACTIVE',
  INVALID_AUDIENCE: 'INVALID_AUDIENCE',
  INVALID_ISSUER: 'INVALID_ISSUER',
  INVALID_TOKEN_TYPE: 'INVALID_TOKEN_TYPE',
} as const;

// Fastify module augmentation
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
    authenticateOptional: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
  
  interface FastifyRequest {
    jwt?: JWTPayload;
  }
}

// Helper type for token generation options
export interface GenerateTokenOptions {
  type: 'api_access' | 'refresh' | 'service';
  audience: string;
  subject?: string;
  scope?: string[];
  metadata?: Record<string, unknown>;
}