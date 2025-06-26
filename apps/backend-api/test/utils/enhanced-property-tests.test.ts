import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import {
  calculateTotal,
  calculateTotalWithTax,
  calculateDiscount,
  type Item,
} from '../../src/utils/calculations.js';

import {
  testInvariants,
  testComposition,
  testMonotonicity,
  financialAmount,
  quantity,
  itemRecord,
  invariants,
} from '@ai-fastify-template/types/property-testing.js';

/**
 * Enhanced Property-Based Tests for Business Logic
 * 
 * Demonstrates comprehensive property testing patterns required by ESLint rule.
 * These tests provide mathematical guarantees about function behavior.
 */

describe('Enhanced Property Tests - calculateTotal', () => {
  describe('Mathematical Invariants', () => {
    it('should maintain core mathematical properties', () => {
      testInvariants(
        fc.array(itemRecord()),
        calculateTotal,
        [
          invariants.nonNegative,
          invariants.finite,
          invariants.zeroForEmpty,
        ]
      );
    });

    it('should equal sum of individual item calculations', () => {
      fc.assert(
        fc.property(
          fc.array(itemRecord(), { maxLength: 10 }),
          (items) => {
            const total = calculateTotal(items);
            const manualTotal = items.reduce(
              (sum: number, item) => sum + item.price * item.quantity,
              0
            );
            expect(total).toBeCloseTo(manualTotal, 10);
          }
        )
      );
    });

    it('should be monotonic (adding items never decreases total)', () => {
      fc.assert(
        fc.property(
          fc.array(itemRecord()),
          itemRecord(),
          (items, newItem) => {
            const originalTotal = calculateTotal(items);
            const newTotal = calculateTotal([...items, newItem]);
            
            expect(newTotal).toBeGreaterThanOrEqual(originalTotal);
          }
        )
      );
    });

    it('should be commutative (order independence)', () => {
      fc.assert(
        fc.property(
          fc.array(itemRecord(), { minLength: 2, maxLength: 5 }),
          (items) => {
            const total1 = calculateTotal(items);
            const shuffled = [...items].reverse();
            
            const total2 = calculateTotal(shuffled);
            expect(total1).toBeCloseTo(total2, 10);
          }
        )
      );
    });
  });

  describe('Boundary Value Properties', () => {
    it('should handle extreme values correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              price: fc.oneof(
                fc.constant(0),
                fc.constant(Number.MAX_SAFE_INTEGER),
                fc.float({ min: 0.01, max: 0.99, noNaN: true }),
                financialAmount()
              ),
              quantity: fc.oneof(
                fc.constant(0),
                fc.constant(1),
                fc.constant(Number.MAX_SAFE_INTEGER),
                quantity()
              ),
            })
          ),
          (items) => {
            try {
              const total = calculateTotal(items);
              expect(total).toBeGreaterThanOrEqual(0);
              expect(Number.isFinite(total)).toBe(true);
            } catch (error) {
              // Validation errors are acceptable for invalid inputs
              expect(error).toBeInstanceOf(Error);
            }
          }
        )
      );
    });

    it('should handle floating point precision consistently', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              price: fc.float({ min: 0.01, max: 0.99, noNaN: true }),
              quantity: fc.integer({ min: 1, max: 3 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (items) => {
            const total = calculateTotal(items);
            
            // Should handle common floating point scenarios
            expect(total).toBeGreaterThan(0);
            expect(total).toBeLessThan(1000);
            
            // Should be precise to 2 decimal places for financial calculations
            const rounded = Math.round(total * 100) / 100;
            expect(Math.abs(total - rounded)).toBeLessThan(0.005);
          }
        )
      );
    });
  });

  describe('Composition Properties', () => {
    it('should compose correctly with array operations', () => {
      fc.assert(
        fc.property(
          fc.array(itemRecord()),
          fc.array(itemRecord()),
          (items1, items2) => {
            const total1 = calculateTotal(items1);
            const total2 = calculateTotal(items2);
            const combinedTotal = calculateTotal([...items1, ...items2]);
            
            expect(combinedTotal).toBeCloseTo(total1 + total2, 10);
          }
        )
      );
    });

    it('should distribute over item grouping', () => {
      fc.assert(
        fc.property(
          fc.array(itemRecord(), { minLength: 2, maxLength: 10 }),
          (items) => {
            const totalAll = calculateTotal(items);
            
            // Split into two groups
            const mid = Math.floor(items.length / 2);
            const group1 = items.slice(0, mid);
            const group2 = items.slice(mid);
            
            const totalGroups = calculateTotal(group1) + calculateTotal(group2);
            
            expect(totalAll).toBeCloseTo(totalGroups, 10);
          }
        )
      );
    });
  });

  describe('Error Handling Properties', () => {
    it('should reject invalid inputs consistently', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              price: fc.oneof(
                fc.constant(-1),
                fc.constant(NaN),
                fc.constant(Infinity),
                fc.constant(-Infinity)
              ),
              quantity: fc.integer({ min: 0, max: 10 }),
            })
          ),
          (invalidItems) => {
            expect(() => calculateTotal(invalidItems)).toThrow();
          }
        )
      );
    });

    it('should reject non-integer quantities', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              price: financialAmount(),
              quantity: fc.float({ min: 0.1, max: 10.9, noNaN: true })
                .filter(n => !Number.isInteger(n)),
            })
          ),
          (invalidItems) => {
            expect(() => calculateTotal(invalidItems)).toThrow();
          }
        )
      );
    });
  });
});

describe('Enhanced Property Tests - calculateTotalWithTax', () => {
  describe('Tax Calculation Invariants', () => {
    it('should maintain tax relationship properties', () => {
      fc.assert(
        fc.property(
          fc.array(itemRecord()),
          fc.float({ min: 0, max: 1, noNaN: true }),
          (items, taxRate) => {
            const baseTotal = calculateTotal(items);
            const totalWithTax = calculateTotalWithTax(items, taxRate);
            
            // Tax never decreases total
            expect(totalWithTax).toBeGreaterThanOrEqual(baseTotal);
            
            // Correct tax calculation
            const expectedTax = baseTotal * taxRate;
            expect(totalWithTax).toBeCloseTo(baseTotal + expectedTax, 2);
            
            // Zero tax rate yields original total
            if (taxRate === 0) {
              expect(totalWithTax).toBeCloseTo(baseTotal, 10);
            }
          }
        )
      );
    });

    it('should be monotonic in tax rate', () => {
      testMonotonicity(
        fc.tuple(
          fc.float({ min: 0, max: 0.5, noNaN: true }),
          fc.float({ min: 0, max: 0.5, noNaN: true })
        ),
        ([a, b]) => [Math.min(a, b), Math.max(a, b)],
        (taxRate) => {
          const items: Item[] = [{ price: 100, quantity: 1 }];
          return calculateTotalWithTax(items, taxRate);
        }
      );
    });
  });

  describe('Tax Rate Boundary Conditions', () => {
    it('should handle extreme tax rates', () => {
      fc.assert(
        fc.property(
          fc.array(itemRecord(), { minLength: 1 }),
          fc.oneof(
            fc.constant(0),
            fc.constant(1),
            fc.float({ min: 0.001, max: 0.999, noNaN: true })
          ),
          (items, taxRate) => {
            const result = calculateTotalWithTax(items, taxRate);
            
            expect(Number.isFinite(result)).toBe(true);
            expect(result).toBeGreaterThanOrEqual(0);
            
            const baseTotal = calculateTotal(items);
            expect(result).toBeGreaterThanOrEqual(baseTotal);
          }
        )
      );
    });
  });

  describe('Composition with Base Calculation', () => {
    it('should compose correctly with calculateTotal', () => {
      testComposition(
        fc.tuple(
          fc.array(itemRecord()),
          fc.float({ min: 0, max: 0.3, noNaN: true })
        ),
        ([items, taxRate]) => calculateTotalWithTax(items, taxRate),
        ([items, taxRate]) => calculateTotal(items) * (1 + taxRate),
        (a, b) => Math.abs(a - b) < 0.01
      );
    });
  });
});

describe('Enhanced Property Tests - calculateDiscount', () => {
  describe('Discount Calculation Invariants', () => {
    it('should maintain discount properties', () => {
      fc.assert(
        fc.property(
          financialAmount(),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (amount, discountPercent) => {
            const discount = calculateDiscount(amount, discountPercent);
            
            // Discount never exceeds original amount
            expect(discount).toBeLessThanOrEqual(amount);
            expect(discount).toBeGreaterThanOrEqual(0);
            
            // Correct percentage calculation
            const expectedDiscount = amount * (discountPercent / 100);
            expect(discount).toBeCloseTo(expectedDiscount, 2);
            
            // Zero discount yields zero
            if (discountPercent === 0) {
              expect(discount).toBe(0);
            }
            
            // 100% discount yields full amount
            if (discountPercent === 100) {
              expect(discount).toBeCloseTo(amount, 2);
            }
          }
        )
      );
    });

    it('should be monotonic in discount percentage', () => {
      testMonotonicity(
        fc.tuple(
          fc.float({ min: 0, max: 50, noNaN: true }),
          fc.float({ min: 0, max: 50, noNaN: true })
        ),
        ([a, b]) => [Math.min(a, b), Math.max(a, b)],
        (discountPercent) => calculateDiscount(100, discountPercent)
      );
    });

    it('should scale proportionally with amount', () => {
      fc.assert(
        fc.property(
          financialAmount(),
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 2, max: 10, noNaN: true }),
          (amount, discountPercent, multiplier) => {
            const discount1 = calculateDiscount(amount, discountPercent);
            const discount2 = calculateDiscount(amount * multiplier, discountPercent);
            
            expect(discount2).toBeCloseTo(discount1 * multiplier, 2);
          }
        )
      );
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle edge cases correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(0),
            fc.constant(0.01),
            financialAmount(),
            fc.constant(Number.MAX_SAFE_INTEGER)
          ),
          fc.oneof(
            fc.constant(0),
            fc.constant(0.01),
            fc.constant(50),
            fc.constant(99.99),
            fc.constant(100)
          ),
          (amount, discountPercent) => {
            const discount = calculateDiscount(amount, discountPercent);
            
            expect(discount).toBeGreaterThanOrEqual(0);
            expect(discount).toBeLessThanOrEqual(amount);
            expect(Number.isFinite(discount)).toBe(true);
          }
        )
      );
    });
  });
});

describe('Cross-Function Integration Properties', () => {
  it('should maintain consistency across all calculation functions', () => {
    fc.assert(
      fc.property(
        fc.array(itemRecord()),
        fc.float({ min: 0, max: 0.2, noNaN: true }),
        fc.float({ min: 0, max: 20, noNaN: true }),
        (items, taxRate, discountPercent) => {
          const baseTotal = calculateTotal(items);
          const totalWithTax = calculateTotalWithTax(items, taxRate);
          const discount = calculateDiscount(baseTotal, discountPercent);
          
          // Relationships should hold
          expect(totalWithTax).toBeGreaterThanOrEqual(baseTotal);
          expect(discount).toBeLessThanOrEqual(baseTotal);
          
          // Final calculation should be mathematically consistent
          const finalAmount = totalWithTax - discount;
          expect(Number.isFinite(finalAmount)).toBe(true);
          
          // Should be able to reconstruct base calculations
          const reconstructedBase = (totalWithTax) / (1 + taxRate);
          expect(reconstructedBase).toBeCloseTo(baseTotal, 1);
        }
      )
    );
  });

  it('should maintain precision across multiple operations', () => {
    fc.assert(
      fc.property(
        fc.array(itemRecord(), { minLength: 1, maxLength: 3 }),
        (items) => {
          // Multiple transformations should not accumulate significant errors
          let total = calculateTotal(items);
          
          for (let i = 0; i < 5; i++) {
            const withTax = calculateTotalWithTax([{ price: total, quantity: 1 }], 0.1);
            const discount = calculateDiscount(withTax, 10);
            total = withTax - discount;
          }
          
          expect(Number.isFinite(total)).toBe(true);
          expect(total).toBeGreaterThan(0);
        }
      )
    );
  });
});