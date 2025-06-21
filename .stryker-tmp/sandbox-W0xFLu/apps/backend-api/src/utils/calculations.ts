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
export const ItemSchema = z.object(stryMutAct_9fa48("14") ? {} : (stryCov_9fa48("14"), {
  price: stryMutAct_9fa48("15") ? z.number().max(0, 'Price must be non-negative') : (stryCov_9fa48("15"), z.number().min(0, stryMutAct_9fa48("16") ? "" : (stryCov_9fa48("16"), 'Price must be non-negative'))),
  quantity: stryMutAct_9fa48("17") ? z.number().int().max(0, 'Quantity must be a non-negative integer') : (stryCov_9fa48("17"), z.number().int().min(0, stryMutAct_9fa48("18") ? "" : (stryCov_9fa48("18"), 'Quantity must be a non-negative integer')))
}));
export const ItemsArraySchema = z.array(ItemSchema);
export type Item = z.infer<typeof ItemSchema>;

/**
 * Calculate the total cost of items with price and quantity validation
 */
export function calculateTotal(items: Item[]): number {
  if (stryMutAct_9fa48("19")) {
    {}
  } else {
    stryCov_9fa48("19");
    // Validate input using Zod
    const validatedItems = ItemsArraySchema.parse(items);
    return validatedItems.reduce((total, item) => {
      if (stryMutAct_9fa48("20")) {
        {}
      } else {
        stryCov_9fa48("20");
        return stryMutAct_9fa48("21") ? total - item.price * item.quantity : (stryCov_9fa48("21"), total + (stryMutAct_9fa48("22") ? item.price / item.quantity : (stryCov_9fa48("22"), item.price * item.quantity)));
      }
    }, 0);
  }
}

/**
 * Calculate total with tax applied
 */
export function calculateTotalWithTax(items: Item[], taxRate: number): number {
  if (stryMutAct_9fa48("23")) {
    {}
  } else {
    stryCov_9fa48("23");
    if (stryMutAct_9fa48("26") ? taxRate < 0 && taxRate > 1 : stryMutAct_9fa48("25") ? false : stryMutAct_9fa48("24") ? true : (stryCov_9fa48("24", "25", "26"), (stryMutAct_9fa48("29") ? taxRate >= 0 : stryMutAct_9fa48("28") ? taxRate <= 0 : stryMutAct_9fa48("27") ? false : (stryCov_9fa48("27", "28", "29"), taxRate < 0)) || (stryMutAct_9fa48("32") ? taxRate <= 1 : stryMutAct_9fa48("31") ? taxRate >= 1 : stryMutAct_9fa48("30") ? false : (stryCov_9fa48("30", "31", "32"), taxRate > 1)))) {
      if (stryMutAct_9fa48("33")) {
        {}
      } else {
        stryCov_9fa48("33");
        throw new Error(stryMutAct_9fa48("34") ? "" : (stryCov_9fa48("34"), 'Tax rate must be between 0 and 1'));
      }
    }
    const subtotal = calculateTotal(items);
    return stryMutAct_9fa48("35") ? subtotal / (1 + taxRate) : (stryCov_9fa48("35"), subtotal * (stryMutAct_9fa48("36") ? 1 - taxRate : (stryCov_9fa48("36"), 1 + taxRate)));
  }
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(amount: number, discountPercentage: number): number {
  if (stryMutAct_9fa48("37")) {
    {}
  } else {
    stryCov_9fa48("37");
    if (stryMutAct_9fa48("40") ? discountPercentage < 0 && discountPercentage > 100 : stryMutAct_9fa48("39") ? false : stryMutAct_9fa48("38") ? true : (stryCov_9fa48("38", "39", "40"), (stryMutAct_9fa48("43") ? discountPercentage >= 0 : stryMutAct_9fa48("42") ? discountPercentage <= 0 : stryMutAct_9fa48("41") ? false : (stryCov_9fa48("41", "42", "43"), discountPercentage < 0)) || (stryMutAct_9fa48("46") ? discountPercentage <= 100 : stryMutAct_9fa48("45") ? discountPercentage >= 100 : stryMutAct_9fa48("44") ? false : (stryCov_9fa48("44", "45", "46"), discountPercentage > 100)))) {
      if (stryMutAct_9fa48("47")) {
        {}
      } else {
        stryCov_9fa48("47");
        throw new Error(stryMutAct_9fa48("48") ? "" : (stryCov_9fa48("48"), 'Discount percentage must be between 0 and 100'));
      }
    }
    return stryMutAct_9fa48("49") ? amount / (discountPercentage / 100) : (stryCov_9fa48("49"), amount * (stryMutAct_9fa48("50") ? discountPercentage * 100 : (stryCov_9fa48("50"), discountPercentage / 100)));
  }
}