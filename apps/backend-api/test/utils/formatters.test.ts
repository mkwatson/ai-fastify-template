import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import {
  formatCurrency,
  formatPercentage,
  formatFileSize,
  type Currency,
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
    expect(formatCurrency(-100.5)).toBe('-$100.50');
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
    expect(() => formatCurrency(Infinity)).toThrow(
      'Amount must be a finite number'
    );
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
    expect(() => formatPercentage(Infinity)).toThrow(
      'Value must be a finite number'
    );
    expect(() => formatPercentage(NaN)).toThrow(
      'Value must be a finite number'
    );
  });

  it('should throw error for invalid decimal places', () => {
    expect(() => formatPercentage(0.5, -1)).toThrow(
      'Decimals must be between 0 and 10'
    );
    expect(() => formatPercentage(0.5, 11)).toThrow(
      'Decimals must be between 0 and 10'
    );
  });

  // Critical test for boundary condition mutation
  it('should accept exactly 10 decimal places', () => {
    expect(formatPercentage(0.123456789, 10)).toBe('12.3456789000%');
  });

  it('should reject exactly 11 decimal places', () => {
    expect(() => formatPercentage(0.5, 11)).toThrow(
      'Decimals must be between 0 and 10'
    );
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
    expect(() => formatFileSize(-100)).toThrow(
      'Bytes must be a non-negative integer'
    );
  });

  it('should throw error for non-integer bytes', () => {
    expect(() => formatFileSize(100.5)).toThrow(
      'Bytes must be a non-negative integer'
    );
  });

  // Critical tests for unit array mutations - these tests specifically target the survived mutants
  it('should use correct unit strings', () => {
    expect(formatFileSize(0)).toContain('B');
    expect(formatFileSize(1024)).toContain('KB');
    expect(formatFileSize(1024 * 1024)).toContain('MB');
    expect(formatFileSize(1024 * 1024 * 1024)).toContain('GB');
    expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toContain('TB');
  });

  it('should not contain empty unit strings', () => {
    expect(formatFileSize(0)).not.toContain(' .');
    expect(formatFileSize(1024)).not.toContain(' .');
    expect(formatFileSize(1024 * 1024)).not.toContain(' .');
  });

  // Specific tests to catch each unit string mutation
  it('should use exact "B" unit string', () => {
    const result = formatFileSize(512);
    expect(result).toMatch(/512\.0 B$/);
    expect(result).not.toMatch(/512\.0 $/); // Would happen if B mutated to empty string
  });

  it('should never return empty unit strings for any size', () => {
    // This specifically catches mutations where first element of units array is changed to ""
    const result = formatFileSize(0); // Uses first unit 'B'
    expect(result).toBe('0.0 B');
    expect(result).not.toBe('0.0 '); // Would happen if units[0] mutated to ""
    expect(result.split(' ')[1]).toBe('B'); // Explicitly check the unit part
  });

  it('should use exact "KB" unit string', () => {
    const result = formatFileSize(1024);
    expect(result).toMatch(/1\.0 KB$/);
    expect(result).not.toMatch(/1\.0 $/); // Would happen if KB mutated to empty string
  });

  it('should use exact "MB" unit string', () => {
    const result = formatFileSize(1024 * 1024);
    expect(result).toMatch(/1\.0 MB$/);
    expect(result).not.toMatch(/1\.0 $/); // Would happen if MB mutated to empty string
  });

  it('should use exact "GB" unit string', () => {
    const result = formatFileSize(1024 * 1024 * 1024);
    expect(result).toMatch(/1\.0 GB$/);
    expect(result).not.toMatch(/1\.0 $/); // Would happen if GB mutated to empty string
  });

  it('should use exact "TB" unit string', () => {
    const result = formatFileSize(1024 * 1024 * 1024 * 1024);
    expect(result).toMatch(/1\.0 TB$/);
    expect(result).not.toMatch(/1\.0 $/); // Would happen if TB mutated to empty string
  });
});

// Property-based tests for comprehensive edge case coverage
describe('Property-based tests - Currency formatting', () => {
  it('should always return strings for any finite number', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000000, max: 1000000, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
        (amount, currency) => {
          if (Number.isFinite(amount)) {
            const result = formatCurrency(amount, currency);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        }
      )
    );
  });

  it('should always include currency symbol in output', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000000, max: 1000000, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
        (amount, currency) => {
          if (Number.isFinite(amount)) {
            const result = formatCurrency(amount, currency);
            // Currency symbols should be present
            const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
            expect(result).toContain(symbols[currency]);
          }
        }
      )
    );
  });

  it('should be monotonic - larger amounts should not format to smaller values', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10000, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP'),
        (base, addition, currency) => {
          if (
            Number.isFinite(base) &&
            Number.isFinite(addition) &&
            addition > 0
          ) {
            const smaller = formatCurrency(base, currency);
            const larger = formatCurrency(base + addition, currency);

            // Extract numeric values for comparison (basic check)
            const smallerNum = parseFloat(smaller.replace(/[^0-9.-]/g, ''));
            const largerNum = parseFloat(larger.replace(/[^0-9.-]/g, ''));

            if (!isNaN(smallerNum) && !isNaN(largerNum)) {
              expect(largerNum).toBeGreaterThanOrEqual(smallerNum);
            }
          }
        }
      )
    );
  });

  it('should never return empty strings for valid inputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000000, max: 1000000, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
        (amount, currency) => {
          if (Number.isFinite(amount)) {
            const result = formatCurrency(amount, currency);
            expect(result).not.toBe('');
            expect(result.trim()).not.toBe('');
          }
        }
      )
    );
  });

  it('should throw for non-finite numbers', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(Infinity, -Infinity, NaN),
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
        (invalidAmount, currency) => {
          expect(() => formatCurrency(invalidAmount, currency)).toThrow();
        }
      )
    );
  });
});

describe('Property-based tests - Percentage formatting', () => {
  it('should always return strings ending with % for finite numbers', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 100, noNaN: true }),
        fc.integer({ min: 0, max: 10 }),
        (value, decimals) => {
          if (Number.isFinite(value)) {
            const result = formatPercentage(value, decimals);
            expect(typeof result).toBe('string');
            expect(result).toMatch(/%$/);
          }
        }
      )
    );
  });

  it('should respect decimal place specification', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.integer({ min: 0, max: 5 }),
        (value, decimals) => {
          if (Number.isFinite(value)) {
            const result = formatPercentage(value, decimals);
            const numericPart = result.replace('%', '');
            const decimalPart = numericPart.split('.')[1];

            if (decimals === 0) {
              expect(result).not.toContain('.');
            } else if (decimalPart) {
              expect(decimalPart).toHaveLength(decimals);
            }
          }
        }
      )
    );
  });

  it('should be monotonic - larger values produce larger percentages', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.float({ min: 0, max: 0.1, noNaN: true }),
        fc.integer({ min: 0, max: 3 }),
        (base, addition, decimals) => {
          if (
            Number.isFinite(base) &&
            Number.isFinite(addition) &&
            addition > 0
          ) {
            const smaller = formatPercentage(base, decimals);
            const larger = formatPercentage(base + addition, decimals);

            const smallerNum = parseFloat(smaller.replace('%', ''));
            const largerNum = parseFloat(larger.replace('%', ''));

            expect(largerNum).toBeGreaterThan(smallerNum);
          }
        }
      )
    );
  });

  it('should throw for invalid decimal specifications', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.oneof(
          fc.integer({ min: -10, max: -1 }),
          fc.integer({ min: 11, max: 20 })
        ),
        (value, invalidDecimals) => {
          expect(() => formatPercentage(value, invalidDecimals)).toThrow();
        }
      )
    );
  });

  it('should throw for non-finite values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(Infinity, -Infinity, NaN),
        fc.integer({ min: 0, max: 5 }),
        (invalidValue, decimals) => {
          expect(() => formatPercentage(invalidValue, decimals)).toThrow();
        }
      )
    );
  });
});

describe('Property-based tests - File size formatting', () => {
  it('should always return strings with unit for non-negative integers', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000000000 }), bytes => {
        const result = formatFileSize(bytes);
        expect(typeof result).toBe('string');
        expect(result).toMatch(/\d+\.\d+ [KMGT]?B$/);
      })
    );
  });

  it('should be monotonic - larger byte counts produce larger or equal formatted values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000000 }),
        fc.integer({ min: 1, max: 1000 }),
        (base, addition) => {
          const smaller = formatFileSize(base);
          const larger = formatFileSize(base + addition);

          // Extract numeric parts for comparison
          const smallerMatch = smaller.match(/^(\d+\.?\d*)/);
          const largerMatch = larger.match(/^(\d+\.?\d*)/);

          if (smallerMatch && largerMatch) {
            const smallerNum = parseFloat(smallerMatch[1]);
            const largerNum = parseFloat(largerMatch[1]);

            // For same unit, larger should be >= smaller
            const smallerUnit = smaller.match(/[KMGT]?B$/)?.[0];
            const largerUnit = larger.match(/[KMGT]?B$/)?.[0];

            if (smallerUnit === largerUnit) {
              expect(largerNum).toBeGreaterThanOrEqual(smallerNum);
            }
          }
        }
      )
    );
  });

  it('should use appropriate units for size ranges', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          [0, 1023, 'B'],
          [1024, 1048575, 'KB'],
          [1048576, 1073741823, 'MB'],
          [1073741824, 1099511627775, 'GB'],
          [1099511627776, Number.MAX_SAFE_INTEGER, 'TB']
        ),
        ([min, max, expectedUnit]) => {
          const bytes = fc.sample(
            fc.integer({ min, max: Math.min(max, 1000000000) }),
            1
          )[0];
          const result = formatFileSize(bytes);
          expect(result).toContain(expectedUnit);
        }
      )
    );
  });

  it('should throw for negative numbers', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: -1 }), negativeBytes => {
        expect(() => formatFileSize(negativeBytes)).toThrow();
      })
    );
  });

  it('should throw for non-integer numbers', () => {
    fc.assert(
      fc.property(fc.float({ min: 0.1, max: 1000.9 }), floatBytes => {
        if (!Number.isInteger(floatBytes)) {
          expect(() => formatFileSize(floatBytes)).toThrow();
        }
      })
    );
  });

  it('should never return empty unit strings', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000000 }), bytes => {
        const result = formatFileSize(bytes);
        const parts = result.split(' ');
        expect(parts).toHaveLength(2);
        expect(parts[1]).not.toBe('');
        expect(parts[1]).toMatch(/^[KMGT]?B$/);
      })
    );
  });
});

// Cross-function property tests - formatter invariants
describe('Property-based tests - Cross-function invariants', () => {
  it('should never throw for valid inputs within expected ranges', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000000, max: 1000000, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 1000000 }),
        (amount, currency, decimals, bytes) => {
          if (Number.isFinite(amount)) {
            expect(() => formatCurrency(amount, currency)).not.toThrow();
          }
          if (Number.isFinite(amount) && decimals >= 0 && decimals <= 10) {
            expect(() => formatPercentage(amount, decimals)).not.toThrow();
          }
          if (Number.isInteger(bytes) && bytes >= 0) {
            expect(() => formatFileSize(bytes)).not.toThrow();
          }
        }
      )
    );
  });

  it('should always return non-empty strings for valid inputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 10000 }),
        (amount, currency, decimals, bytes) => {
          if (Number.isFinite(amount)) {
            const currencyResult = formatCurrency(amount, currency);
            expect(currencyResult.length).toBeGreaterThan(0);
          }
          if (Number.isFinite(amount)) {
            const percentResult = formatPercentage(amount, decimals);
            expect(percentResult.length).toBeGreaterThan(0);
          }
          const fileSizeResult = formatFileSize(bytes);
          expect(fileSizeResult.length).toBeGreaterThan(0);
        }
      )
    );
  });

  it('should be deterministic - same inputs produce same outputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 10000 }),
        (amount, currency, decimals, bytes) => {
          if (Number.isFinite(amount)) {
            const currency1 = formatCurrency(amount, currency);
            const currency2 = formatCurrency(amount, currency);
            expect(currency1).toBe(currency2);

            const percent1 = formatPercentage(amount, decimals);
            const percent2 = formatPercentage(amount, decimals);
            expect(percent1).toBe(percent2);
          }

          const fileSize1 = formatFileSize(bytes);
          const fileSize2 = formatFileSize(bytes);
          expect(fileSize1).toBe(fileSize2);
        }
      )
    );
  });
});
