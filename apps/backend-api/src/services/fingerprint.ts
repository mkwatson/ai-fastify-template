import type { FastifyRequest } from 'fastify';
import type {
  RequestFingerprint,
  FingerprintStats,
} from '../types/fingerprint.js';

// In-memory store for MVP - replace with Redis for production
const fingerprintStore = new Map<string, FingerprintStats>();

export function extractFingerprint(
  request: FastifyRequest
): RequestFingerprint {
  const fingerprint: RequestFingerprint = {
    ip: request.ip,
    timestamp: Date.now(),
  };

  // Add optional fields only if they exist
  const userAgent = request.headers['user-agent'];
  if (userAgent) fingerprint.userAgent = userAgent;

  const acceptLanguage = request.headers['accept-language'];
  if (acceptLanguage) fingerprint.acceptLanguage = acceptLanguage;

  const acceptEncoding = request.headers['accept-encoding'];
  if (acceptEncoding) fingerprint.acceptEncoding = acceptEncoding;

  const origin = request.headers.origin;
  if (origin) fingerprint.origin = origin;

  return fingerprint;
}

export function trackFingerprint(
  origin: string,
  fingerprint: RequestFingerprint
): void {
  const key = `origin:${origin}`;
  const stats = fingerprintStore.get(key) || {
    uniqueIps: new Set<string>(),
    uniqueUserAgents: new Set<string>(),
    requestCount: 0,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
  };

  stats.uniqueIps.add(fingerprint.ip);
  if (fingerprint.userAgent) {
    stats.uniqueUserAgents.add(fingerprint.userAgent);
  }
  stats.requestCount++;
  stats.lastSeen = Date.now();

  fingerprintStore.set(key, stats);
}

export function getOriginStats(origin: string): FingerprintStats | undefined {
  return fingerprintStore.get(`origin:${origin}`);
}

export function isOriginSuspicious(origin: string): boolean {
  const stats = getOriginStats(origin);
  if (!stats) return false;

  const timeWindowMs = 3600000; // 1 hour
  const now = Date.now();

  // Suspicious patterns:
  // 1. Too many unique IPs in short time (distributed attack)
  if (stats.uniqueIps.size > 100 && now - stats.firstSeen < timeWindowMs) {
    return true;
  }

  // 2. High request rate from multiple IPs
  const requestsPerMinute =
    stats.requestCount / ((now - stats.firstSeen) / 60000);
  if (stats.uniqueIps.size > 10 && requestsPerMinute > 100) {
    return true;
  }

  // 3. Too many different user agents (bot behavior)
  if (stats.uniqueUserAgents.size > 50) {
    return true;
  }

  return false;
}

// Cleanup old entries periodically (every hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [key, stats] of fingerprintStore.entries()) {
    if (stats.lastSeen < oneHourAgo) {
      fingerprintStore.delete(key);
    }
  }
}, 3600000);
