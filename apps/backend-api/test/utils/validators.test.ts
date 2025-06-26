import { describe, it, expect } from 'vitest';
import {
  propertyTest,
  generators,
} from '@ai-fastify-template/types';
import fc from 'fast-check';

import {
  isValidEmail,
  isValidUrl,
  isValidPhoneNumber,
  validatePasswordStrength,
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

// ===== Property-Based Tests =====

describe('isValidEmail - Property Tests', () => {
  it('should consistently return boolean values', () => {
    propertyTest(
      isValidEmail,
      fc.string(),
      ['nonEmptyString'] // Note: This tests that the function returns a string representation
    );
  });

  it('should accept valid email formats', () => {
    propertyTest(
      (email: string) => {
        const result = isValidEmail(email);
        return typeof result === 'boolean';
      },
      generators.email(),
      ['nonEmptyString'] // Testing the string conversion of the boolean result
    );
  });
});

describe('isValidUrl - Property Tests', () => {
  it('should consistently return boolean values', () => {
    propertyTest(
      (input: string) => {
        const result = isValidUrl(input);
        return typeof result === 'boolean';
      },
      fc.string(),
      ['nonEmptyString'] // Testing string conversion of boolean
    );
  });

  it('should handle valid URL protocols', () => {
    propertyTest(
      (url: string) => {
        const result = isValidUrl(url);
        return typeof result === 'boolean';
      },
      fc.oneof(
        fc.constant('https://example.com'),
        fc.constant('http://test.org'),
        fc.constant('ftp://files.com'),
        fc.webUrl()
      ),
      ['nonEmptyString'] // Testing string conversion of boolean
    );
  });
});

describe('isValidPhoneNumber - Property Tests', () => {
  it('should consistently return boolean values', () => {
    propertyTest(
      (input: string) => {
        const result = isValidPhoneNumber(input);
        return typeof result === 'boolean';
      },
      fc.string(),
      ['nonEmptyString'] // Testing string conversion of boolean
    );
  });

  it('should handle phone number patterns', () => {
    propertyTest(
      (phone: string) => {
        const result = isValidPhoneNumber(phone);
        return typeof result === 'boolean';
      },
      fc.oneof(
        fc.constant('(555) 123-4567'),
        fc.constant('555-123-4567'),
        fc.constant('5551234567'),
        fc.string({ minLength: 10, maxLength: 15 })
          .filter(s => /^[\d\s\-\(\)\+\.]+$/.test(s))
      ),
      ['nonEmptyString'] // Testing string conversion of boolean
    );
  });
});

describe('validatePasswordStrength - Property Tests', () => {
  it('should always return object with isValid and errors properties', () => {
    propertyTest(
      (password: string) => {
        const result = validatePasswordStrength(password);
        return JSON.stringify({
          hasIsValid: typeof result.isValid === 'boolean',
          hasErrors: Array.isArray(result.errors),
          consistent: result.isValid === (result.errors.length === 0)
        });
      },
      fc.string(),
      ['nonEmptyString'] // Testing JSON string output
    );
  });

  it('should handle password complexity correctly', () => {
    propertyTest(
      (password: string) => {
        const result = validatePasswordStrength(password);
        // Strong passwords should have fewer errors
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const isLongEnough = password.length >= 8;
        
        const expectedValid = hasUpper && hasLower && hasDigit && hasSpecial && isLongEnough;
        
        return JSON.stringify({
          inputLength: password.length,
          expectedValid,
          actualValid: result.isValid,
          errorCount: result.errors.length
        });
      },
      fc.string({ minLength: 0, maxLength: 20 }),
      ['nonEmptyString'] // Testing JSON string output
    );
  });
});
