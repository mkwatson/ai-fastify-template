import fc from 'fast-check';

/**
 * Property Testing Templates and Generators
 *
 * Provides reusable generators and templates for comprehensive property-based testing
 * with fast-check. These ensure mathematical guarantees about function behavior.
 */

// ===== COMMON GENERATORS =====

/**
 * Generator for financial amounts (non-negative numbers with 2 decimal precision)
 */
export const financialAmount = () =>
  fc
    .float({ min: 0, max: 1_000_000, noNaN: true })
    .map(n => Math.round(n * 100) / 100);

/**
 * Generator for percentages (0-100)
 */
export const percentage = () => fc.float({ min: 0, max: 100, noNaN: true });

/**
 * Generator for tax rates (0-1)
 */
export const taxRate = () => fc.float({ min: 0, max: 1, noNaN: true });

/**
 * Generator for quantities (non-negative integers)
 */
export const quantity = () => fc.integer({ min: 0, max: 1000 });

/**
 * Generator for item records with price and quantity
 */
export const itemRecord = () =>
  fc.record({
    price: financialAmount(),
    quantity: quantity(),
  });

/**
 * Generator for arrays of items
 */
export const itemsArray = (options?: {
  minLength?: number;
  maxLength?: number;
}) => fc.array(itemRecord(), options);

// ===== PROPERTY TEST TEMPLATES =====

/**
 * Template for testing mathematical invariants
 *
 * @param generator - Fast-check generator for input data
 * @param testFunction - Function under test
 * @param invariants - Array of invariant functions to check
 *
 * @example
 * testInvariants(
 *   fc.array(itemRecord()),
 *   calculateTotal,
 *   [
 *     (input, output) => output >= 0, // Non-negative result
 *     (input, output) => input.length === 0 ? output === 0 : output > 0 // Zero for empty
 *   ]
 * );
 */
export function testInvariants<T, R>(
  generator: fc.Arbitrary<T>,
  testFunction: (input: T) => R,
  invariants: Array<(input: T, output: R) => boolean>,
  options?: fc.Parameters<[T]>
) {
  return fc.assert(
    fc.property(generator, input => {
      const output = testFunction(input);

      for (const invariant of invariants) {
        if (!invariant(input, output)) {
          throw new Error(
            `Invariant violation for input: ${JSON.stringify(input)}`
          );
        }
      }

      return true;
    }),
    options
  );
}

/**
 * Template for testing function composition properties
 *
 * @example
 * testComposition(
 *   fc.array(itemRecord()),
 *   (items) => calculateTotalWithTax(items, 0.1),
 *   (items) => calculateTotal(items) * 1.1,
 *   (result1, result2) => Math.abs(result1 - result2) < 0.01
 * );
 */
export function testComposition<T, R>(
  generator: fc.Arbitrary<T>,
  method1: (input: T) => R,
  method2: (input: T) => R,
  equality: (a: R, b: R) => boolean = (a, b) => a === b,
  options?: fc.Parameters<[T]>
) {
  return fc.assert(
    fc.property(generator, input => {
      const result1 = method1(input);
      const result2 = method2(input);
      return equality(result1, result2);
    }),
    options
  );
}

/**
 * Template for testing monotonicity (function is non-decreasing)
 *
 * @example
 * testMonotonicity(
 *   fc.tuple(percentage(), percentage()),
 *   ([a, b]) => [Math.min(a, b), Math.max(a, b)],
 *   ([smaller, larger]) => calculateDiscount(100, smaller) <= calculateDiscount(100, larger)
 * );
 */
export function testMonotonicity<T, R>(
  generator: fc.Arbitrary<T>,
  orderInputs: (input: T) => [T, T],
  testFunction: (input: T) => R,
  comparison: (smaller: R, larger: R) => boolean = (a, b) => a <= b,
  options?: fc.Parameters<[T]>
) {
  return fc.assert(
    fc.property(generator, input => {
      const [smallerInput, largerInput] = orderInputs(input);
      const smallerResult = testFunction(smallerInput);
      const largerResult = testFunction(largerInput);
      return comparison(smallerResult, largerResult);
    }),
    options
  );
}

/**
 * Template for testing idempotency (f(f(x)) = f(x))
 */
export function testIdempotency<T>(
  generator: fc.Arbitrary<T>,
  testFunction: (input: T) => T,
  equality: (a: T, b: T) => boolean = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b),
  options?: fc.Parameters<[T]>
) {
  return fc.assert(
    fc.property(generator, input => {
      const result1 = testFunction(input);
      const result2 = testFunction(result1);
      return equality(result1, result2);
    }),
    options
  );
}

/**
 * Template for testing commutativity (f(a, b) = f(b, a))
 */
export function testCommutativity<T, R>(
  generator: fc.Arbitrary<[T, T]>,
  testFunction: (a: T, b: T) => R,
  equality: (a: R, b: R) => boolean = (a, b) => a === b,
  options?: fc.Parameters<[[T, T]]>
) {
  return fc.assert(
    fc.property(generator, ([a, b]) => {
      const result1 = testFunction(a, b);
      const result2 = testFunction(b, a);
      return equality(result1, result2);
    }),
    options
  );
}

/**
 * Template for testing associativity (f(f(a, b), c) = f(a, f(b, c)))
 */
export function testAssociativity<T>(
  generator: fc.Arbitrary<[T, T, T]>,
  testFunction: (a: T, b: T) => T,
  equality: (a: T, b: T) => boolean = (a, b) => a === b,
  options?: fc.Parameters<[[T, T, T]]>
) {
  return fc.assert(
    fc.property(generator, ([a, b, c]) => {
      const result1 = testFunction(testFunction(a, b), c);
      const result2 = testFunction(a, testFunction(b, c));
      return equality(result1, result2);
    }),
    options
  );
}

// ===== DOMAIN-SPECIFIC GENERATORS =====

/**
 * E-commerce domain generators
 */
export const ecommerce = {
  /**
   * Product with realistic constraints
   */
  product: () =>
    fc.record({
      id: fc.uuid(),
      name: fc.lorem({ maxCount: 3 }),
      price: financialAmount(),
      category: fc.constantFrom('electronics', 'clothing', 'books', 'home'),
      inStock: fc.boolean(),
      weight: fc.float({ min: 0.1, max: 50, noNaN: true }),
    }),

  /**
   * Shopping cart with multiple items
   */
  cart: () =>
    fc.record({
      items: fc.array(
        fc.record({
          productId: fc.uuid(),
          quantity: quantity(),
          priceAtTimeOfAdd: financialAmount(),
        }),
        { maxLength: 20 }
      ),
      customerId: fc.uuid(),
      discountCode: fc.option(fc.string({ minLength: 6, maxLength: 10 })),
    }),

  /**
   * Order with payment and shipping
   */
  order: () =>
    fc.record({
      id: fc.uuid(),
      customerId: fc.uuid(),
      items: fc.array(itemRecord()),
      shippingAddress: fc.record({
        street: fc.lorem({ maxCount: 2 }),
        city: fc.lorem({ maxCount: 1 }),
        zipCode: fc.string({ minLength: 5, maxLength: 10 }),
        country: fc.constantFrom('US', 'CA', 'UK', 'DE', 'FR'),
      }),
      taxRate: taxRate(),
      shippingCost: financialAmount(),
    }),
};

/**
 * Financial domain generators
 */
export const financial = {
  /**
   * Currency amount with realistic constraints
   */
  money: (currency: string = 'USD') =>
    fc.record({
      amount: financialAmount(),
      currency: fc.constant(currency),
    }),

  /**
   * Transaction record
   */
  transaction: () =>
    fc.record({
      id: fc.uuid(),
      amount: financialAmount(),
      type: fc.constantFrom('debit', 'credit'),
      timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
      description: fc.lorem({ maxCount: 5 }),
      category: fc.constantFrom(
        'food',
        'transport',
        'entertainment',
        'utilities'
      ),
    }),

  /**
   * Interest rate (realistic banking rates)
   */
  interestRate: () => fc.float({ min: 0, max: 0.2, noNaN: true }),
};

// ===== STATEFUL TESTING UTILITIES =====

/**
 * Model-based testing command interface template
 * Note: This is a simplified template. For complex model-based testing,
 * use the model-based-testing.ts file with proper fast-check commands.
 */
export interface SimpleCommand<Model, Real> {
  check(model: Model): boolean;
  run(model: Model, real: Real): void;
  toString(): string;
}

/**
 * Simple stateful test template
 * For production use, prefer the full model-based testing framework
 */
export function createStatefulTestTemplate(commands: string[]): {
  commands: string[];
  example: string;
} {
  return {
    commands,
    example: `
// Example usage:
fc.assert(
  fc.property(
    fc.array(fc.constantFrom(...${JSON.stringify(commands)})),
    (operations) => {
      const model = createModel();
      const real = createReal();

      for (const op of operations) {
        executeOperation(op, model, real);
        verifyInvariant(model, real);
      }
    }
  )
);`,
  };
}

// ===== COMMON INVARIANTS =====

/**
 * Collection of common mathematical invariants
 */
export const invariants = {
  /**
   * Result must be non-negative
   */
  nonNegative: <T>(_input: T, output: number) => output >= 0,

  /**
   * Result must be positive for non-empty input
   */
  positiveForNonEmpty: <T extends { length: number }>(
    input: T,
    output: number
  ) => (input.length === 0 ? output === 0 : output > 0),

  /**
   * Result must be zero for empty input
   */
  zeroForEmpty: <T extends { length: number }>(_input: T, output: number) =>
    output === 0, // Simplified for template

  /**
   * Result must be less than or equal to sum of inputs
   */
  boundedBySum: (
    input: { price: number; quantity: number }[],
    output: number
  ) =>
    output <=
    input.reduce((sum, item) => sum + item.price * item.quantity, 0) + 0.01, // Allow for floating point errors

  /**
   * Result must be finite (not NaN or Infinity)
   */
  finite: <T>(_input: T, output: number) => Number.isFinite(output),

  /**
   * Order independence (for commutative operations)
   * Note: This is a template - actual implementation would test with shuffled input
   */
  orderIndependent: () => true, // Simplified template
};
