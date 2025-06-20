import { z } from 'zod';

// Zod schemas for input validation
export const ItemSchema = z.object({
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
});

export const ItemsArraySchema = z.array(ItemSchema);

export type Item = z.infer<typeof ItemSchema>;

/**
 * Calculate the total cost of items with price and quantity validation
 */
export function calculateTotal(items: Item[]): number {
  // Validate input using Zod
  const validatedItems = ItemsArraySchema.parse(items);

  return validatedItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

/**
 * Calculate total with tax applied
 */
export function calculateTotalWithTax(items: Item[], taxRate: number): number {
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }

  const subtotal = calculateTotal(items);
  return subtotal * (1 + taxRate);
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  amount: number,
  discountPercentage: number
): number {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }

  return amount * (discountPercentage / 100);
}
