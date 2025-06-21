import { z } from 'zod';

// Zod schemas for validation
export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'JPY']);
export const LocaleSchema = z.string().min(2);

export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Format currency with proper locale and currency code validation
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'USD',
  locale: string = 'en-US'
): string {
  // Validate inputs
  CurrencySchema.parse(currency);
  LocaleSchema.parse(locale);

  if (!Number.isFinite(amount)) {
    throw new Error('Amount must be a finite number');
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value)) {
    throw new Error('Value must be a finite number');
  }

  if (decimals < 0 || decimals > 10) {
    throw new Error('Decimals must be between 0 and 10');
  }

  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isInteger(bytes) || bytes < 0) {
    throw new Error('Bytes must be a non-negative integer');
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Use the units array to ensure mutations are meaningful
  const unit = units.at(unitIndex) ?? 'B';
  return `${size.toFixed(1)} ${unit}`;
}
