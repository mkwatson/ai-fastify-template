import { describe, it, expect } from 'vitest';

import {
  formatCurrency,
  formatPercentage,
  formatFileSize,
  type Currency
} from '../../src/utils/formatters.js';

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format different currencies', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
    expect(formatCurrency(1234.56, 'JPY')).toBe('¥1,235'); // JPY doesn't use decimals
  });

  it('should handle zero amount', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-100.50)).toBe('-$100.50');
  });

  it('should handle very large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should handle very small numbers', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });

  it('should work with different locales', () => {
    const result = formatCurrency(1234.56, 'EUR', 'de-DE');
    // Different Node.js versions may format differently, just check it contains euro symbol and digits
    expect(result).toContain('€');
    expect(result).toMatch(/1.*2.*3.*4/); // Contains the digits in order
  });

  it('should throw error for invalid currency', () => {
    expect(() => formatCurrency(100, 'INVALID' as Currency)).toThrow();
  });

  it('should throw error for non-finite amounts', () => {
    expect(() => formatCurrency(Infinity)).toThrow('Amount must be a finite number');
    expect(() => formatCurrency(NaN)).toThrow('Amount must be a finite number');
  });

  it('should throw error for invalid locale', () => {
    expect(() => formatCurrency(100, 'USD', 'x')).toThrow();
  });
});

describe('formatPercentage', () => {
  it('should format percentage with default 2 decimals', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%');
  });

  it('should format percentage with custom decimals', () => {
    expect(formatPercentage(0.1234, 0)).toBe('12%');
    expect(formatPercentage(0.1234, 1)).toBe('12.3%');
    expect(formatPercentage(0.1234, 3)).toBe('12.340%');
  });

  it('should handle zero percentage', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });

  it('should handle negative percentages', () => {
    expect(formatPercentage(-0.05)).toBe('-5.00%');
  });

  it('should handle percentages over 100%', () => {
    expect(formatPercentage(1.5)).toBe('150.00%');
  });

  it('should throw error for non-finite values', () => {
    expect(() => formatPercentage(Infinity)).toThrow('Value must be a finite number');
    expect(() => formatPercentage(NaN)).toThrow('Value must be a finite number');
  });

  it('should throw error for invalid decimal places', () => {
    expect(() => formatPercentage(0.5, -1)).toThrow('Decimals must be between 0 and 10');
    expect(() => formatPercentage(0.5, 11)).toThrow('Decimals must be between 0 and 10');
  });
});

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0.0 B');
    expect(formatFileSize(512)).toBe('512.0 B');
    expect(formatFileSize(1023)).toBe('1023.0 B');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1048575)).toBe('1024.0 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
  });

  it('should format terabytes correctly', () => {
    expect(formatFileSize(1099511627776)).toBe('1.0 TB');
  });

  it('should handle very large files', () => {
    expect(formatFileSize(1125899906842624)).toBe('1024.0 TB');
  });

  it('should throw error for negative bytes', () => {
    expect(() => formatFileSize(-100)).toThrow('Bytes must be a non-negative integer');
  });

  it('should throw error for non-integer bytes', () => {
    expect(() => formatFileSize(100.5)).toThrow('Bytes must be a non-negative integer');
  });
});
