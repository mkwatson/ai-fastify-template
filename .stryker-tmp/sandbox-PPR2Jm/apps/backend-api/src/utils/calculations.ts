// @ts-nocheck
function stryNS_9fa48() {
  var g =
    (typeof globalThis === 'object' &&
      globalThis &&
      globalThis.Math === Math &&
      globalThis) ||
    new Function('return this')();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (
    ns.activeMutant === undefined &&
    g.process &&
    g.process.env &&
    g.process.env.__STRYKER_ACTIVE_MUTANT__
  ) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov =
    ns.mutantCoverage ||
    (ns.mutantCoverage = {
      static: {},
      perTest: {},
    });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error(
          'Stryker: Hit count limit reached (' + ns.hitCount + ')'
        );
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { z } from 'zod';

// Zod schemas for input validation
export const ItemSchema = z.object(
  stryMutAct_9fa48('90')
    ? {}
    : (stryCov_9fa48('90'),
      {
        price: stryMutAct_9fa48('91')
          ? z.number().max(0, 'Price must be non-negative')
          : (stryCov_9fa48('91'),
            z
              .number()
              .min(
                0,
                stryMutAct_9fa48('92')
                  ? ''
                  : (stryCov_9fa48('92'), 'Price must be non-negative')
              )),
        quantity: stryMutAct_9fa48('93')
          ? z.number().int().max(0, 'Quantity must be a non-negative integer')
          : (stryCov_9fa48('93'),
            z
              .number()
              .int()
              .min(
                0,
                stryMutAct_9fa48('94')
                  ? ''
                  : (stryCov_9fa48('94'),
                    'Quantity must be a non-negative integer')
              )),
      })
);
export const ItemsArraySchema = z.array(ItemSchema);
export type Item = z.infer<typeof ItemSchema>;

/**
 * Calculate the total cost of items with price and quantity validation
 */
export function calculateTotal(items: Item[]): number {
  if (stryMutAct_9fa48('95')) {
    {
    }
  } else {
    stryCov_9fa48('95');
    // Validate input using Zod
    const validatedItems = ItemsArraySchema.parse(items);
    return validatedItems.reduce((total, item) => {
      if (stryMutAct_9fa48('96')) {
        {
        }
      } else {
        stryCov_9fa48('96');
        return stryMutAct_9fa48('97')
          ? total - item.price * item.quantity
          : (stryCov_9fa48('97'),
            total +
              (stryMutAct_9fa48('98')
                ? item.price / item.quantity
                : (stryCov_9fa48('98'), item.price * item.quantity)));
      }
    }, 0);
  }
}

/**
 * Calculate total with tax applied
 */
export function calculateTotalWithTax(items: Item[], taxRate: number): number {
  if (stryMutAct_9fa48('99')) {
    {
    }
  } else {
    stryCov_9fa48('99');
    if (
      stryMutAct_9fa48('102')
        ? taxRate < 0 && taxRate > 1
        : stryMutAct_9fa48('101')
          ? false
          : stryMutAct_9fa48('100')
            ? true
            : (stryCov_9fa48('100', '101', '102'),
              (stryMutAct_9fa48('105')
                ? taxRate >= 0
                : stryMutAct_9fa48('104')
                  ? taxRate <= 0
                  : stryMutAct_9fa48('103')
                    ? false
                    : (stryCov_9fa48('103', '104', '105'), taxRate < 0)) ||
                (stryMutAct_9fa48('108')
                  ? taxRate <= 1
                  : stryMutAct_9fa48('107')
                    ? taxRate >= 1
                    : stryMutAct_9fa48('106')
                      ? false
                      : (stryCov_9fa48('106', '107', '108'), taxRate > 1)))
    ) {
      if (stryMutAct_9fa48('109')) {
        {
        }
      } else {
        stryCov_9fa48('109');
        throw new Error(
          stryMutAct_9fa48('110')
            ? ''
            : (stryCov_9fa48('110'), 'Tax rate must be between 0 and 1')
        );
      }
    }
    const subtotal = calculateTotal(items);
    return stryMutAct_9fa48('111')
      ? subtotal / (1 + taxRate)
      : (stryCov_9fa48('111'),
        subtotal *
          (stryMutAct_9fa48('112')
            ? 1 - taxRate
            : (stryCov_9fa48('112'), 1 + taxRate)));
  }
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  amount: number,
  discountPercentage: number
): number {
  if (stryMutAct_9fa48('113')) {
    {
    }
  } else {
    stryCov_9fa48('113');
    if (
      stryMutAct_9fa48('116')
        ? discountPercentage < 0 && discountPercentage > 100
        : stryMutAct_9fa48('115')
          ? false
          : stryMutAct_9fa48('114')
            ? true
            : (stryCov_9fa48('114', '115', '116'),
              (stryMutAct_9fa48('119')
                ? discountPercentage >= 0
                : stryMutAct_9fa48('118')
                  ? discountPercentage <= 0
                  : stryMutAct_9fa48('117')
                    ? false
                    : (stryCov_9fa48('117', '118', '119'),
                      discountPercentage < 0)) ||
                (stryMutAct_9fa48('122')
                  ? discountPercentage <= 100
                  : stryMutAct_9fa48('121')
                    ? discountPercentage >= 100
                    : stryMutAct_9fa48('120')
                      ? false
                      : (stryCov_9fa48('120', '121', '122'),
                        discountPercentage > 100)))
    ) {
      if (stryMutAct_9fa48('123')) {
        {
        }
      } else {
        stryCov_9fa48('123');
        throw new Error(
          stryMutAct_9fa48('124')
            ? ''
            : (stryCov_9fa48('124'),
              'Discount percentage must be between 0 and 100')
        );
      }
    }
    return stryMutAct_9fa48('125')
      ? amount / (discountPercentage / 100)
      : (stryCov_9fa48('125'),
        amount *
          (stryMutAct_9fa48('126')
            ? discountPercentage * 100
            : (stryCov_9fa48('126'), discountPercentage / 100)));
  }
}
