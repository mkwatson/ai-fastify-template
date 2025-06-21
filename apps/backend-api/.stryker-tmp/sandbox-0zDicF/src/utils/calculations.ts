// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
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
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
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
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
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
export const ItemSchema = z.object(stryMutAct_9fa48("111") ? {} : (stryCov_9fa48("111"), {
  price: stryMutAct_9fa48("112") ? z.number().max(0, 'Price must be non-negative') : (stryCov_9fa48("112"), z.number().min(0, stryMutAct_9fa48("113") ? "" : (stryCov_9fa48("113"), 'Price must be non-negative'))),
  quantity: stryMutAct_9fa48("114") ? z.number().int().max(0, 'Quantity must be a non-negative integer') : (stryCov_9fa48("114"), z.number().int().min(0, stryMutAct_9fa48("115") ? "" : (stryCov_9fa48("115"), 'Quantity must be a non-negative integer')))
}));
export const ItemsArraySchema = z.array(ItemSchema);
export type Item = z.infer<typeof ItemSchema>;

/**
 * Calculate the total cost of items with price and quantity validation
 */
export function calculateTotal(items: Item[]): number {
  if (stryMutAct_9fa48("116")) {
    {}
  } else {
    stryCov_9fa48("116");
    // Validate input using Zod
    const validatedItems = ItemsArraySchema.parse(items);
    return validatedItems.reduce((total, item) => {
      if (stryMutAct_9fa48("117")) {
        {}
      } else {
        stryCov_9fa48("117");
        return stryMutAct_9fa48("118") ? total - item.price * item.quantity : (stryCov_9fa48("118"), total + (stryMutAct_9fa48("119") ? item.price / item.quantity : (stryCov_9fa48("119"), item.price * item.quantity)));
      }
    }, 0);
  }
}

/**
 * Calculate total with tax applied
 */
export function calculateTotalWithTax(items: Item[], taxRate: number): number {
  if (stryMutAct_9fa48("120")) {
    {}
  } else {
    stryCov_9fa48("120");
    if (stryMutAct_9fa48("123") ? taxRate < 0 && taxRate > 1 : stryMutAct_9fa48("122") ? false : stryMutAct_9fa48("121") ? true : (stryCov_9fa48("121", "122", "123"), (stryMutAct_9fa48("126") ? taxRate >= 0 : stryMutAct_9fa48("125") ? taxRate <= 0 : stryMutAct_9fa48("124") ? false : (stryCov_9fa48("124", "125", "126"), taxRate < 0)) || (stryMutAct_9fa48("129") ? taxRate <= 1 : stryMutAct_9fa48("128") ? taxRate >= 1 : stryMutAct_9fa48("127") ? false : (stryCov_9fa48("127", "128", "129"), taxRate > 1)))) {
      if (stryMutAct_9fa48("130")) {
        {}
      } else {
        stryCov_9fa48("130");
        throw new Error(stryMutAct_9fa48("131") ? "" : (stryCov_9fa48("131"), 'Tax rate must be between 0 and 1'));
      }
    }
    const subtotal = calculateTotal(items);
    return stryMutAct_9fa48("132") ? subtotal / (1 + taxRate) : (stryCov_9fa48("132"), subtotal * (stryMutAct_9fa48("133") ? 1 - taxRate : (stryCov_9fa48("133"), 1 + taxRate)));
  }
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(amount: number, discountPercentage: number): number {
  if (stryMutAct_9fa48("134")) {
    {}
  } else {
    stryCov_9fa48("134");
    if (stryMutAct_9fa48("137") ? discountPercentage < 0 && discountPercentage > 100 : stryMutAct_9fa48("136") ? false : stryMutAct_9fa48("135") ? true : (stryCov_9fa48("135", "136", "137"), (stryMutAct_9fa48("140") ? discountPercentage >= 0 : stryMutAct_9fa48("139") ? discountPercentage <= 0 : stryMutAct_9fa48("138") ? false : (stryCov_9fa48("138", "139", "140"), discountPercentage < 0)) || (stryMutAct_9fa48("143") ? discountPercentage <= 100 : stryMutAct_9fa48("142") ? discountPercentage >= 100 : stryMutAct_9fa48("141") ? false : (stryCov_9fa48("141", "142", "143"), discountPercentage > 100)))) {
      if (stryMutAct_9fa48("144")) {
        {}
      } else {
        stryCov_9fa48("144");
        throw new Error(stryMutAct_9fa48("145") ? "" : (stryCov_9fa48("145"), 'Discount percentage must be between 0 and 100'));
      }
    }
    return stryMutAct_9fa48("146") ? amount / (discountPercentage / 100) : (stryCov_9fa48("146"), amount * (stryMutAct_9fa48("147") ? discountPercentage * 100 : (stryCov_9fa48("147"), discountPercentage / 100)));
  }
}