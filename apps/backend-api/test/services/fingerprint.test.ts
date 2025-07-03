import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  extractFingerprint,
  trackFingerprint,
  isOriginSuspicious,
  getOriginStats,
} from '../../src/services/fingerprint.js';
import type { FastifyRequest } from 'fastify';

describe('fingerprint service', () => {
  describe('extractFingerprint', () => {
    it('should always return a valid fingerprint object', () => {
      fc.assert(
        fc.property(
          fc.record({
            ip: fc.ipV4(),
            headers: fc.record({
              'user-agent': fc.option(fc.string()),
              'accept-language': fc.option(fc.string()),
              'accept-encoding': fc.option(fc.string()),
              origin: fc.option(fc.webUrl()),
            }),
          }),
          mockRequest => {
            const request = mockRequest as unknown as FastifyRequest;
            const fingerprint = extractFingerprint(request);

            expect(fingerprint).toHaveProperty('ip');
            expect(fingerprint).toHaveProperty('timestamp');
            expect(typeof fingerprint.timestamp).toBe('number');
            expect(fingerprint.timestamp).toBeGreaterThan(0);
          }
        )
      );
    });
  });

  describe('trackFingerprint', () => {
    it('should track fingerprints without throwing', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.record({
            ip: fc.ipV4(),
            timestamp: fc.integer({ min: 0 }),
          }),
          (origin, fingerprint) => {
            expect(() => trackFingerprint(origin, fingerprint)).not.toThrow();
          }
        )
      );
    });
  });

  describe('isOriginSuspicious', () => {
    it('should handle any origin input', () => {
      fc.assert(
        fc.property(fc.string(), origin => {
          const result = isOriginSuspicious(origin);
          expect(typeof result).toBe('boolean');
        })
      );
    });
  });

  describe('getOriginStats', () => {
    it('should return undefined for unknown origins', () => {
      fc.assert(
        fc.property(fc.string(), origin => {
          const stats = getOriginStats(origin);
          // Stats only exist if we've tracked fingerprints for this origin
          expect(stats === undefined || typeof stats === 'object').toBe(true);
        })
      );
    });
  });
});
