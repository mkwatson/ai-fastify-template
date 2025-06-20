import { z } from 'zod';

/**
 * Email validation with proper regex and Zod schema
 */
export const EmailSchema = z.string().email('Invalid email format');

export function isValidEmail(email: string): boolean {
  try {
    EmailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * URL validation with Zod schema
 */
export const UrlSchema = z.string().url('Invalid URL format');

export function isValidUrl(url: string): boolean {
  try {
    UrlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Phone number validation (simple US format)
 */
export const PhoneSchema = z.string().regex(
  /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  'Invalid phone number format'
);

export function isValidPhoneNumber(phone: string): boolean {
  try {
    PhoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Password strength validation
 */
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  try {
    PasswordSchema.parse(password);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message),
      };
    }
    return { isValid: false, errors: ['Unknown validation error'] };
  }
}
