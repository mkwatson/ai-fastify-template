// JWT types following standard claims

export interface JWTPayload {
  // Standard JWT claims
  sub: string; // Subject: session/client identifier
  aud: string; // Audience: intended recipient (our API)
  iat?: number; // Issued at (added by fastify-jwt)
  exp?: number; // Expiration (added by fastify-jwt)

  // Custom claims
  type: 'access' | 'refresh'; // Token type for future extensions
}
