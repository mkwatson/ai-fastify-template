// Minimal JWT types for the token endpoint

// Simple JWT payload type for our tokens
export interface JWTPayload {
  origin: string;
  iat?: number;
  exp?: number;
}
