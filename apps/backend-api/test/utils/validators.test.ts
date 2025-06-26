import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import {
  isValidEmail,
  isValidUrl,
  isValidPhoneNumber,
  validatePasswordStrength,
  EmailSchema,
  UrlSchema,
  PhoneSchema,
  PasswordSchema,
} from '../../src/utils/validators.js';

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    expect(isValidEmail('123@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test..test@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://subdomain.example.com/path')).toBe(true);
    expect(isValidUrl('https://example.com:8080/path?query=value')).toBe(true);
    expect(isValidUrl('ftp://files.example.com')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('http://')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('https://')).toBe(false);
  });
});

describe('isValidPhoneNumber', () => {
  it('should validate correct US phone numbers', () => {
    expect(isValidPhoneNumber('(555) 123-4567')).toBe(true);
    expect(isValidPhoneNumber('555-123-4567')).toBe(true);
    expect(isValidPhoneNumber('555.123.4567')).toBe(true);
    expect(isValidPhoneNumber('5551234567')).toBe(true);
    expect(isValidPhoneNumber('+1 555 123 4567')).toBe(true);
    expect(isValidPhoneNumber('1-555-123-4567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhoneNumber('123')).toBe(false);
    expect(isValidPhoneNumber('555-12-34567')).toBe(false);
    expect(isValidPhoneNumber('(555) 123-456')).toBe(false);
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber('abc-def-ghij')).toBe(false);
    expect(isValidPhoneNumber('+44 20 7946 0958')).toBe(false); // UK number
  });
});

describe('validatePasswordStrength', () => {
  it('should validate strong passwords', () => {
    const result = validatePasswordStrength('StrongP@ssw0rd');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate another strong password', () => {
    const result = validatePasswordStrength('MySecure123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject password too short', () => {
    const result = validatePasswordStrength('Short1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('should reject password without uppercase', () => {
    const result = validatePasswordStrength('nouppercasehere1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one uppercase letter'
    );
  });

  it('should reject password without lowercase', () => {
    const result = validatePasswordStrength('NOLOWERCASEHERE1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one lowercase letter'
    );
  });

  it('should reject password without numbers', () => {
    const result = validatePasswordStrength('NoNumbersHere!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one number'
    );
  });

  it('should reject password without special characters', () => {
    const result = validatePasswordStrength('NoSpecialChars123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one special character'
    );
  });

  it('should return multiple errors for weak password', () => {
    const result = validatePasswordStrength('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors).toContain('Password must be at least 8 characters');
    expect(result.errors).toContain(
      'Password must contain at least one uppercase letter'
    );
    expect(result.errors).toContain(
      'Password must contain at least one number'
    );
    expect(result.errors).toContain(
      'Password must contain at least one special character'
    );
  });

  it('should handle empty string password', () => {
    const result = validatePasswordStrength('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('should handle null-like input gracefully', () => {
    // Test with whitespace-only password
    const result = validatePasswordStrength('   ');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// Property-based tests for comprehensive edge case coverage
describe('Property-based tests - Email validation', () => {
  it('should never accept strings without @ symbol', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.includes('@') && s.length > 0),
        invalidEmail => {
          expect(isValidEmail(invalidEmail)).toBe(false);
        }
      )
    );
  });

  it('should never accept strings with multiple @ symbols', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.string(),
        (prefix, middle, suffix) => {
          const invalidEmail = `${prefix}@${middle}@${suffix}`;
          expect(isValidEmail(invalidEmail)).toBe(false);
        }
      )
    );
  });

  it('should be consistent between function and schema validation', () => {
    fc.assert(
      fc.property(fc.string(), emailString => {
        const functionResult = isValidEmail(emailString);
        let schemaResult;
        try {
          EmailSchema.parse(emailString);
          schemaResult = true;
        } catch {
          schemaResult = false;
        }
        expect(functionResult).toBe(schemaResult);
      })
    );
  });

  it('should handle edge cases gracefully without throwing', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string().map(s => s.repeat(1000)), // Very long strings
          fc.constant(''), // Empty string
          fc.string().filter(s => s.includes('\0')), // Null bytes
          fc.string().filter(s => s.includes('\n')) // Newlines
        ),
        edgeCase => {
          expect(() => isValidEmail(edgeCase)).not.toThrow();
          expect(typeof isValidEmail(edgeCase)).toBe('boolean');
        }
      )
    );
  });
});

describe('Property-based tests - URL validation', () => {
  it('should never accept URLs without protocol', () => {
    fc.assert(
      fc.property(fc.domain(), domain => {
        expect(isValidUrl(domain)).toBe(false);
        expect(isValidUrl(`www.${domain}`)).toBe(false);
      })
    );
  });

  it('should be consistent between function and schema validation', () => {
    fc.assert(
      fc.property(fc.string(), urlString => {
        const functionResult = isValidUrl(urlString);
        let schemaResult;
        try {
          UrlSchema.parse(urlString);
          schemaResult = true;
        } catch {
          schemaResult = false;
        }
        expect(functionResult).toBe(schemaResult);
      })
    );
  });

  it('should handle various protocol schemes without throwing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('http', 'https', 'ftp', 'ftps', 'file', 'invalid'),
        fc.domain(),
        (protocol, domain) => {
          const url = `${protocol}://${domain}`;
          expect(() => isValidUrl(url)).not.toThrow();
          expect(typeof isValidUrl(url)).toBe('boolean');
        }
      )
    );
  });
});

describe('Property-based tests - Phone number validation', () => {
  it('should never accept phone numbers with letters', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => /[a-zA-Z]/.test(s)),
        phoneWithLetters => {
          expect(isValidPhoneNumber(phoneWithLetters)).toBe(false);
        }
      )
    );
  });

  it('should be consistent between function and schema validation', () => {
    fc.assert(
      fc.property(fc.string(), phoneString => {
        const functionResult = isValidPhoneNumber(phoneString);
        let schemaResult;
        try {
          PhoneSchema.parse(phoneString);
          schemaResult = true;
        } catch {
          schemaResult = false;
        }
        expect(functionResult).toBe(schemaResult);
      })
    );
  });

  it('should handle digit combinations gracefully', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), {
          minLength: 1,
          maxLength: 15,
        }),
        fc.constantFrom('', '-', '.', ' ', '()', '()-'),
        (digits, separator) => {
          const phoneAttempt = digits.join(separator);
          expect(() => isValidPhoneNumber(phoneAttempt)).not.toThrow();
          expect(typeof isValidPhoneNumber(phoneAttempt)).toBe('boolean');
        }
      )
    );
  });
});

describe('Property-based tests - Password strength validation', () => {
  it('should always reject passwords shorter than 8 characters', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 7 }), shortPassword => {
        const result = validatePasswordStrength(shortPassword);
        expect(result.isValid).toBe(false);
        expect(
          result.errors.some(error => error.includes('8 characters'))
        ).toBe(true);
      })
    );
  });

  it('should require all character types for validity', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8 }).filter(s => /^[a-z]+$/.test(s)), // Only lowercase
        lowercaseOnly => {
          const result = validatePasswordStrength(lowercaseOnly);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(error => error.includes('uppercase'))).toBe(
            true
          );
        }
      )
    );
  });

  it('should be consistent between function and schema validation', () => {
    fc.assert(
      fc.property(fc.string(), passwordString => {
        const functionResult = validatePasswordStrength(passwordString);
        let schemaResult;
        try {
          PasswordSchema.parse(passwordString);
          schemaResult = { isValid: true, errors: [] };
        } catch (error) {
          const zodError = error;
          schemaResult = {
            isValid: false,
            errors: zodError.errors.map(err => err.message),
          };
        }
        expect(functionResult.isValid).toBe(schemaResult.isValid);
        if (!functionResult.isValid) {
          expect(functionResult.errors).toHaveLength(
            schemaResult.errors.length
          );
        }
      })
    );
  });

  it('should accept passwords with all required character types', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 4 }).filter(s => /[A-Z]/.test(s)), // Has uppercase
        fc.string({ minLength: 2 }).filter(s => /[a-z]/.test(s)), // Has lowercase
        fc.string({ minLength: 1 }).filter(s => /[0-9]/.test(s)), // Has number
        fc.string({ minLength: 1 }).filter(s => /[^A-Za-z0-9]/.test(s)), // Has special char
        (upper, lower, number, special) => {
          const strongPassword = upper + lower + number + special;
          if (strongPassword.length >= 8) {
            const result = validatePasswordStrength(strongPassword);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        }
      )
    );
  });
});

// Cross-function property tests - validator invariants
describe('Property-based tests - Cross-function invariants', () => {
  it('should never throw exceptions for any string input', () => {
    fc.assert(
      fc.property(fc.string(), inputString => {
        expect(() => isValidEmail(inputString)).not.toThrow();
        expect(() => isValidUrl(inputString)).not.toThrow();
        expect(() => isValidPhoneNumber(inputString)).not.toThrow();
        expect(() => validatePasswordStrength(inputString)).not.toThrow();
      })
    );
  });

  it('should always return appropriate result types', () => {
    fc.assert(
      fc.property(fc.string(), inputString => {
        expect(typeof isValidEmail(inputString)).toBe('boolean');
        expect(typeof isValidUrl(inputString)).toBe('boolean');
        expect(typeof isValidPhoneNumber(inputString)).toBe('boolean');

        const passwordResult = validatePasswordStrength(inputString);
        expect(typeof passwordResult.isValid).toBe('boolean');
        expect(Array.isArray(passwordResult.errors)).toBe(true);
      })
    );
  });

  it('should be deterministic - same input always produces same output', () => {
    fc.assert(
      fc.property(fc.string(), inputString => {
        const email1 = isValidEmail(inputString);
        const email2 = isValidEmail(inputString);
        expect(email1).toBe(email2);

        const url1 = isValidUrl(inputString);
        const url2 = isValidUrl(inputString);
        expect(url1).toBe(url2);

        const phone1 = isValidPhoneNumber(inputString);
        const phone2 = isValidPhoneNumber(inputString);
        expect(phone1).toBe(phone2);

        const password1 = validatePasswordStrength(inputString);
        const password2 = validatePasswordStrength(inputString);
        expect(password1.isValid).toBe(password2.isValid);
        expect(password1.errors).toEqual(password2.errors);
      })
    );
  });
});
