import type { FastifyRequest } from 'fastify';
import { createHash } from 'node:crypto';

// Simplified fingerprinting for MVP abuse prevention
// Tracks request patterns per origin without complex stats
const recentRequests = new Map<string, number[]>();

// Cleanup interval reference for graceful shutdown
let cleanupInterval: NodeJS.Timeout | undefined;

export function extractFingerprint(request: FastifyRequest): string {
  // Create a simple hash of identifying characteristics
  const parts = [
    request.ip,
    request.headers['user-agent'] || 'unknown',
    request.headers['accept-language'] || 'unknown',
  ].join('|');

  return createHash('sha256').update(parts).digest('hex').substring(0, 16);
}

export function trackOriginRequest(origin: string): void {
  const now = Date.now();
  const requests = recentRequests.get(origin) || [];

  // Keep only requests from last hour
  const recentHour = requests.filter(t => now - t < 3600000);
  recentHour.push(now);

  recentRequests.set(origin, recentHour);
}

export function isOriginSuspicious(origin: string): boolean {
  const requests = recentRequests.get(origin) || [];

  // Simple threshold: >1000 requests/hour suggests abuse
  // This allows ~16 requests/minute across all IPs from an origin
  return requests.length > 1000;
}

// Start periodic cleanup (call during app initialization)
export function startFingerprintCleanup(): void {
  cleanupInterval = setInterval(() => {
    const oneHourAgo = Date.now() - 3600000;
    for (const [origin, requests] of recentRequests.entries()) {
      const recent = requests.filter(t => t > oneHourAgo);
      if (recent.length === 0) {
        recentRequests.delete(origin);
      } else {
        recentRequests.set(origin, recent);
      }
    }
  }, 3600000); // Run every hour
}

// Stop cleanup (call during graceful shutdown)
export function stopFingerprintCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = undefined;
  }
}
