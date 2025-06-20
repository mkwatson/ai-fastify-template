import { describe, it, expect } from 'vitest';

import {
  calculateTotal,
  calculateTotalWithTax,
  calculateDiscount,
  type Item
} from '../../src/utils/calculations.js';

describe('calculateTotal', () => {
  it('should calculate total for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should calculate total for single item', () => {
    const items: Item[] = [{ price: 10.50, quantity: 2 }];
    expect(calculateTotal(items)).toBe(21);
  });

  it('should calculate total for multiple items', () => {
    const items: Item[] = [
      { price: 10, quantity: 2 },
      { price: 5.99, quantity: 3 },
      { price: 15.50, quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe(53.47);
  });

  it('should handle zero quantities', () => {
    const items: Item[] = [
      { price: 10, quantity: 0 },
      { price: 5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(15);
  });

  it('should handle zero prices', () => {
    const items: Item[] = [
      { price: 0, quantity: 5 },
      { price: 10, quantity: 2 },
    ];
    expect(calculateTotal(items)).toBe(20);
  });

  it('should throw error for negative price', () => {
    const items = [{ price: -10, quantity: 2 }];
    expect(() => calculateTotal(items)).toThrow('Price must be non-negative');
  });

  it('should throw error for negative quantity', () => {
    const items = [{ price: 10, quantity: -2 }];
    expect(() => calculateTotal(items)).toThrow('Quantity must be a non-negative integer');
  });

  it('should throw error for non-integer quantity', () => {
    const items = [{ price: 10, quantity: 2.5 }];
    expect(() => calculateTotal(items)).toThrow();
  });
});

describe('calculateTotalWithTax', () => {
  const items: Item[] = [{ price: 100, quantity: 1 }];

  it('should calculate total with tax correctly', () => {
    expect(calculateTotalWithTax(items, 0.08)).toBe(108);
  });

  it('should handle zero tax rate', () => {
    expect(calculateTotalWithTax(items, 0)).toBe(100);
  });

  it('should handle 100% tax rate', () => {
    expect(calculateTotalWithTax(items, 1)).toBe(200);
  });

  it('should throw error for negative tax rate', () => {
    expect(() => calculateTotalWithTax(items, -0.1)).toThrow('Tax rate must be between 0 and 1');
  });

  it('should throw error for tax rate over 100%', () => {
    expect(() => calculateTotalWithTax(items, 1.5)).toThrow('Tax rate must be between 0 and 1');
  });
});

describe('calculateDiscount', () => {
  it('should calculate discount correctly', () => {
    expect(calculateDiscount(100, 10)).toBe(10);
    expect(calculateDiscount(50, 20)).toBe(10);
  });

  it('should handle zero discount', () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });

  it('should handle 100% discount', () => {
    expect(calculateDiscount(100, 100)).toBe(100);
  });

  it('should throw error for negative discount percentage', () => {
    expect(() => calculateDiscount(100, -10)).toThrow('Discount percentage must be between 0 and 100');
  });

  it('should throw error for discount percentage over 100', () => {
    expect(() => calculateDiscount(100, 150)).toThrow('Discount percentage must be between 0 and 100');
  });
});
