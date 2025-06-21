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

// Zod schemas for validation
export const CurrencySchema = z.enum(stryMutAct_9fa48("51") ? [] : (stryCov_9fa48("51"), [stryMutAct_9fa48("52") ? "" : (stryCov_9fa48("52"), 'USD'), stryMutAct_9fa48("53") ? "" : (stryCov_9fa48("53"), 'EUR'), stryMutAct_9fa48("54") ? "" : (stryCov_9fa48("54"), 'GBP'), stryMutAct_9fa48("55") ? "" : (stryCov_9fa48("55"), 'JPY')]));
export const LocaleSchema = stryMutAct_9fa48("56") ? z.string().max(2) : (stryCov_9fa48("56"), z.string().min(2));
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Format currency with proper locale and currency code validation
 */
export function formatCurrency(amount: number, currency: Currency = stryMutAct_9fa48("57") ? "" : (stryCov_9fa48("57"), 'USD'), locale: string = stryMutAct_9fa48("58") ? "" : (stryCov_9fa48("58"), 'en-US')): string {
  if (stryMutAct_9fa48("59")) {
    {}
  } else {
    stryCov_9fa48("59");
    // Validate inputs
    CurrencySchema.parse(currency);
    LocaleSchema.parse(locale);
    if (stryMutAct_9fa48("62") ? false : stryMutAct_9fa48("61") ? true : stryMutAct_9fa48("60") ? Number.isFinite(amount) : (stryCov_9fa48("60", "61", "62"), !Number.isFinite(amount))) {
      if (stryMutAct_9fa48("63")) {
        {}
      } else {
        stryCov_9fa48("63");
        throw new Error(stryMutAct_9fa48("64") ? "" : (stryCov_9fa48("64"), 'Amount must be a finite number'));
      }
    }
    return new Intl.NumberFormat(locale, stryMutAct_9fa48("65") ? {} : (stryCov_9fa48("65"), {
      style: stryMutAct_9fa48("66") ? "" : (stryCov_9fa48("66"), 'currency'),
      currency
    })).format(amount);
  }
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (stryMutAct_9fa48("67")) {
    {}
  } else {
    stryCov_9fa48("67");
    if (stryMutAct_9fa48("70") ? false : stryMutAct_9fa48("69") ? true : stryMutAct_9fa48("68") ? Number.isFinite(value) : (stryCov_9fa48("68", "69", "70"), !Number.isFinite(value))) {
      if (stryMutAct_9fa48("71")) {
        {}
      } else {
        stryCov_9fa48("71");
        throw new Error(stryMutAct_9fa48("72") ? "" : (stryCov_9fa48("72"), 'Value must be a finite number'));
      }
    }
    if (stryMutAct_9fa48("75") ? decimals < 0 && decimals > 10 : stryMutAct_9fa48("74") ? false : stryMutAct_9fa48("73") ? true : (stryCov_9fa48("73", "74", "75"), (stryMutAct_9fa48("78") ? decimals >= 0 : stryMutAct_9fa48("77") ? decimals <= 0 : stryMutAct_9fa48("76") ? false : (stryCov_9fa48("76", "77", "78"), decimals < 0)) || (stryMutAct_9fa48("81") ? decimals <= 10 : stryMutAct_9fa48("80") ? decimals >= 10 : stryMutAct_9fa48("79") ? false : (stryCov_9fa48("79", "80", "81"), decimals > 10)))) {
      if (stryMutAct_9fa48("82")) {
        {}
      } else {
        stryCov_9fa48("82");
        throw new Error(stryMutAct_9fa48("83") ? "" : (stryCov_9fa48("83"), 'Decimals must be between 0 and 10'));
      }
    }
    return stryMutAct_9fa48("84") ? `` : (stryCov_9fa48("84"), `${(stryMutAct_9fa48("85") ? value / 100 : (stryCov_9fa48("85"), value * 100)).toFixed(decimals)}%`);
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (stryMutAct_9fa48("86")) {
    {}
  } else {
    stryCov_9fa48("86");
    if (stryMutAct_9fa48("89") ? !Number.isInteger(bytes) && bytes < 0 : stryMutAct_9fa48("88") ? false : stryMutAct_9fa48("87") ? true : (stryCov_9fa48("87", "88", "89"), (stryMutAct_9fa48("90") ? Number.isInteger(bytes) : (stryCov_9fa48("90"), !Number.isInteger(bytes))) || (stryMutAct_9fa48("93") ? bytes >= 0 : stryMutAct_9fa48("92") ? bytes <= 0 : stryMutAct_9fa48("91") ? false : (stryCov_9fa48("91", "92", "93"), bytes < 0)))) {
      if (stryMutAct_9fa48("94")) {
        {}
      } else {
        stryCov_9fa48("94");
        throw new Error(stryMutAct_9fa48("95") ? "" : (stryCov_9fa48("95"), 'Bytes must be a non-negative integer'));
      }
    }
    const units = stryMutAct_9fa48("96") ? [] : (stryCov_9fa48("96"), [stryMutAct_9fa48("97") ? "" : (stryCov_9fa48("97"), 'B'), stryMutAct_9fa48("98") ? "" : (stryCov_9fa48("98"), 'KB'), stryMutAct_9fa48("99") ? "" : (stryCov_9fa48("99"), 'MB'), stryMutAct_9fa48("100") ? "" : (stryCov_9fa48("100"), 'GB'), stryMutAct_9fa48("101") ? "" : (stryCov_9fa48("101"), 'TB')]);
    let size = bytes;
    let unitIndex = 0;
    while (stryMutAct_9fa48("103") ? size >= 1024 || unitIndex < units.length - 1 : stryMutAct_9fa48("102") ? false : (stryCov_9fa48("102", "103"), (stryMutAct_9fa48("106") ? size < 1024 : stryMutAct_9fa48("105") ? size > 1024 : stryMutAct_9fa48("104") ? true : (stryCov_9fa48("104", "105", "106"), size >= 1024)) && (stryMutAct_9fa48("109") ? unitIndex >= units.length - 1 : stryMutAct_9fa48("108") ? unitIndex <= units.length - 1 : stryMutAct_9fa48("107") ? true : (stryCov_9fa48("107", "108", "109"), unitIndex < (stryMutAct_9fa48("110") ? units.length + 1 : (stryCov_9fa48("110"), units.length - 1)))))) {
      if (stryMutAct_9fa48("111")) {
        {}
      } else {
        stryCov_9fa48("111");
        stryMutAct_9fa48("112") ? size *= 1024 : (stryCov_9fa48("112"), size /= 1024);
        stryMutAct_9fa48("113") ? unitIndex-- : (stryCov_9fa48("113"), unitIndex++);
      }
    }

    // Use the units array to ensure mutations are meaningful
    return stryMutAct_9fa48("114") ? `` : (stryCov_9fa48("114"), `${size.toFixed(1)} ${stryMutAct_9fa48("117") ? units[unitIndex] && 'B' : stryMutAct_9fa48("116") ? false : stryMutAct_9fa48("115") ? true : (stryCov_9fa48("115", "116", "117"), units[unitIndex] || (stryMutAct_9fa48("118") ? "" : (stryCov_9fa48("118"), 'B')))}`);
  }
}