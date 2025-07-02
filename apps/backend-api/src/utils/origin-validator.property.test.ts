import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { normalizeOrigin, OriginValidator } from './origin-validator.js';

describe('normalizeOrigin property tests', () => {
  it('should always produce lowercase protocol and hostname', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const normalized = normalizeOrigin(url);
          const parsedUrl = new URL(normalized);
          
          expect(parsedUrl.protocol).toBe(parsedUrl.protocol.toLowerCase());
          expect(parsedUrl.hostname).toBe(parsedUrl.hostname.toLowerCase());
        }
      )
    );
  });

  it('should remove paths, query params, and fragments', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string(),
        fc.string(),
        fc.string(),
        (baseUrl, path, query, fragment) => {
          const urlWithExtras = `${baseUrl}/${path}?${query}#${fragment}`;
          const normalized = normalizeOrigin(urlWithExtras);
          
          expect(normalized).not.toContain('?');
          expect(normalized).not.toContain('#');
          expect(normalized).not.toContain(path);
        }
      )
    );
  });

  it('should normalize default ports consistently', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('http', 'https'),
        fc.domain(),
        (protocol, domain) => {
          const defaultPort = protocol === 'https' ? '443' : '80';
          const urlWithPort = `${protocol}://${domain}:${defaultPort}`;
          const urlWithoutPort = `${protocol}://${domain}`;
          
          expect(normalizeOrigin(urlWithPort)).toBe(normalizeOrigin(urlWithoutPort));
        }
      )
    );
  });

  it('should preserve non-default ports', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('http', 'https'),
        fc.domain(),
        fc.integer({ min: 1, max: 65535 }).filter(p => p !== 80 && p !== 443),
        (protocol, domain, port) => {
          const url = `${protocol}://${domain}:${port}`;
          const normalized = normalizeOrigin(url);
          
          expect(normalized).toContain(`:${port}`);
        }
      )
    );
  });

  it('should be idempotent', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const normalized1 = normalizeOrigin(url);
          const normalized2 = normalizeOrigin(normalized1);
          
          expect(normalized1).toBe(normalized2);
        }
      )
    );
  });

  it('should throw on invalid URLs', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => {
          try {
            new URL(s);
            return false;
          } catch {
            return true;
          }
        }),
        (invalidUrl) => {
          expect(() => normalizeOrigin(invalidUrl)).toThrow('Invalid origin format');
        }
      )
    );
  });
});

describe('OriginValidator property tests', () => {
  it('should accept all normalized origins that were in the initial list', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }),
        (origins) => {
          const validator = new OriginValidator(origins);
          
          origins.forEach(origin => {
            // Should accept the original
            expect(validator.isAllowed(origin)).toBe(true);
            // Should accept the normalized version
            expect(validator.isAllowed(normalizeOrigin(origin))).toBe(true);
          });
        }
      )
    );
  });

  it('should reject origins not in the list', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
        fc.webUrl(),
        (allowedOrigins, testOrigin) => {
          // Make sure testOrigin is different from allowed ones
          const normalizedTest = normalizeOrigin(testOrigin);
          const normalizedAllowed = allowedOrigins.map(normalizeOrigin);
          
          if (!normalizedAllowed.includes(normalizedTest)) {
            const validator = new OriginValidator(allowedOrigins);
            expect(validator.isAllowed(testOrigin)).toBe(false);
          }
        }
      )
    );
  });

  it('should handle wildcard correctly', () => {
    const validator = new OriginValidator(['*']);
    
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          expect(validator.isAllowed(url)).toBe(true);
          expect(validator.isWildcardEnabled()).toBe(true);
        }
      )
    );
  });

  it('should reject all origins when empty array provided', () => {
    const validator = new OriginValidator([]);
    
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          expect(validator.isAllowed(url)).toBe(false);
          expect(validator.isWildcardEnabled()).toBe(false);
        }
      )
    );
  });

  it('should handle case variations correctly', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const validator = new OriginValidator([url]);
          const upperUrl = url.toUpperCase();
          const lowerUrl = url.toLowerCase();
          
          expect(validator.isAllowed(upperUrl)).toBe(true);
          expect(validator.isAllowed(lowerUrl)).toBe(true);
        }
      )
    );
  });

  it('should reject undefined and empty origins', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
        (origins) => {
          const validator = new OriginValidator(origins);
          
          expect(validator.isAllowed(undefined)).toBe(false);
          expect(validator.isAllowed('')).toBe(false);
        }
      )
    );
  });

  it('should return consistent allowed origins list', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }),
        (origins) => {
          const validator = new OriginValidator(origins);
          const allowedList = validator.getAllowedOrigins();
          
          // Should have same length (unless duplicates)
          const normalizedSet = new Set(origins.map(normalizeOrigin));
          expect(allowedList.length).toBe(normalizedSet.size);
          
          // All should be normalized
          allowedList.forEach(origin => {
            expect(origin).toBe(normalizeOrigin(origin));
          });
        }
      )
    );
  });
});