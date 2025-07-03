import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  extractFingerprint,
  trackOriginRequest,
  isOriginSuspicious,
  startFingerprintCleanup,
  stopFingerprintCleanup,
} from '../../src/services/fingerprint.js';
import type { FastifyRequest } from 'fastify';

describe('fingerprint service', () => {
  beforeEach(() => {
    startFingerprintCleanup();
  });

  afterEach(() => {
    stopFingerprintCleanup();
  });

  describe('extractFingerprint', () => {
    it('should always return a valid fingerprint hash', () => {
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

            expect(typeof fingerprint).toBe('string');
            expect(fingerprint).toHaveLength(16); // SHA256 truncated to 16 chars
            expect(fingerprint).toMatch(/^[a-f0-9]{16}$/);
          }
        )
      );
    });

    it('should produce consistent hashes for same input', () => {
      const mockRequest = {
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'Mozilla/5.0',
          'accept-language': 'en-US',
        },
      } as unknown as FastifyRequest;

      const hash1 = extractFingerprint(mockRequest);
      const hash2 = extractFingerprint(mockRequest);

      expect(hash1).toBe(hash2);
    });
  });

  describe('trackOriginRequest', () => {
    it('should track requests without throwing', () => {
      fc.assert(
        fc.property(fc.webUrl(), origin => {
          expect(() => trackOriginRequest(origin)).not.toThrow();
        })
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

    it('should flag origin as suspicious after threshold', () => {
      const origin = 'https://suspicious.example.com';

      // Track 999 requests - should not be suspicious
      for (let i = 0; i < 999; i++) {
        trackOriginRequest(origin);
      }
      expect(isOriginSuspicious(origin)).toBe(false);

      // Track 2 more to exceed threshold
      trackOriginRequest(origin);
      trackOriginRequest(origin);
      expect(isOriginSuspicious(origin)).toBe(true);
    });
  });
});
