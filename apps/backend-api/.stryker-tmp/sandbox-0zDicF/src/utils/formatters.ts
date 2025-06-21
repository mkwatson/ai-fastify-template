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
export const CurrencySchema = z.enum(stryMutAct_9fa48("148") ? [] : (stryCov_9fa48("148"), [stryMutAct_9fa48("149") ? "" : (stryCov_9fa48("149"), 'USD'), stryMutAct_9fa48("150") ? "" : (stryCov_9fa48("150"), 'EUR'), stryMutAct_9fa48("151") ? "" : (stryCov_9fa48("151"), 'GBP'), stryMutAct_9fa48("152") ? "" : (stryCov_9fa48("152"), 'JPY')]));
export const LocaleSchema = stryMutAct_9fa48("153") ? z.string().max(2) : (stryCov_9fa48("153"), z.string().min(2));
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Format currency with proper locale and currency code validation
 */
export function formatCurrency(amount: number, currency: Currency = stryMutAct_9fa48("154") ? "" : (stryCov_9fa48("154"), 'USD'), locale: string = stryMutAct_9fa48("155") ? "" : (stryCov_9fa48("155"), 'en-US')): string {
  if (stryMutAct_9fa48("156")) {
    {}
  } else {
    stryCov_9fa48("156");
    // Validate inputs
    CurrencySchema.parse(currency);
    LocaleSchema.parse(locale);
    if (stryMutAct_9fa48("159") ? false : stryMutAct_9fa48("158") ? true : stryMutAct_9fa48("157") ? Number.isFinite(amount) : (stryCov_9fa48("157", "158", "159"), !Number.isFinite(amount))) {
      if (stryMutAct_9fa48("160")) {
        {}
      } else {
        stryCov_9fa48("160");
        throw new Error(stryMutAct_9fa48("161") ? "" : (stryCov_9fa48("161"), 'Amount must be a finite number'));
      }
    }
    return new Intl.NumberFormat(locale, stryMutAct_9fa48("162") ? {} : (stryCov_9fa48("162"), {
      style: stryMutAct_9fa48("163") ? "" : (stryCov_9fa48("163"), 'currency'),
      currency
    })).format(amount);
  }
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (stryMutAct_9fa48("164")) {
    {}
  } else {
    stryCov_9fa48("164");
    if (stryMutAct_9fa48("167") ? false : stryMutAct_9fa48("166") ? true : stryMutAct_9fa48("165") ? Number.isFinite(value) : (stryCov_9fa48("165", "166", "167"), !Number.isFinite(value))) {
      if (stryMutAct_9fa48("168")) {
        {}
      } else {
        stryCov_9fa48("168");
        throw new Error(stryMutAct_9fa48("169") ? "" : (stryCov_9fa48("169"), 'Value must be a finite number'));
      }
    }
    if (stryMutAct_9fa48("172") ? decimals < 0 && decimals > 10 : stryMutAct_9fa48("171") ? false : stryMutAct_9fa48("170") ? true : (stryCov_9fa48("170", "171", "172"), (stryMutAct_9fa48("175") ? decimals >= 0 : stryMutAct_9fa48("174") ? decimals <= 0 : stryMutAct_9fa48("173") ? false : (stryCov_9fa48("173", "174", "175"), decimals < 0)) || (stryMutAct_9fa48("178") ? decimals <= 10 : stryMutAct_9fa48("177") ? decimals >= 10 : stryMutAct_9fa48("176") ? false : (stryCov_9fa48("176", "177", "178"), decimals > 10)))) {
      if (stryMutAct_9fa48("179")) {
        {}
      } else {
        stryCov_9fa48("179");
        throw new Error(stryMutAct_9fa48("180") ? "" : (stryCov_9fa48("180"), 'Decimals must be between 0 and 10'));
      }
    }
    return stryMutAct_9fa48("181") ? `` : (stryCov_9fa48("181"), `${(stryMutAct_9fa48("182") ? value / 100 : (stryCov_9fa48("182"), value * 100)).toFixed(decimals)}%`);
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (stryMutAct_9fa48("183")) {
    {}
  } else {
    stryCov_9fa48("183");
    if (stryMutAct_9fa48("186") ? !Number.isInteger(bytes) && bytes < 0 : stryMutAct_9fa48("185") ? false : stryMutAct_9fa48("184") ? true : (stryCov_9fa48("184", "185", "186"), (stryMutAct_9fa48("187") ? Number.isInteger(bytes) : (stryCov_9fa48("187"), !Number.isInteger(bytes))) || (stryMutAct_9fa48("190") ? bytes >= 0 : stryMutAct_9fa48("189") ? bytes <= 0 : stryMutAct_9fa48("188") ? false : (stryCov_9fa48("188", "189", "190"), bytes < 0)))) {
      if (stryMutAct_9fa48("191")) {
        {}
      } else {
        stryCov_9fa48("191");
        throw new Error(stryMutAct_9fa48("192") ? "" : (stryCov_9fa48("192"), 'Bytes must be a non-negative integer'));
      }
    }
    const units = stryMutAct_9fa48("193") ? [] : (stryCov_9fa48("193"), [stryMutAct_9fa48("194") ? "" : (stryCov_9fa48("194"), 'B'), stryMutAct_9fa48("195") ? "" : (stryCov_9fa48("195"), 'KB'), stryMutAct_9fa48("196") ? "" : (stryCov_9fa48("196"), 'MB'), stryMutAct_9fa48("197") ? "" : (stryCov_9fa48("197"), 'GB'), stryMutAct_9fa48("198") ? "" : (stryCov_9fa48("198"), 'TB')]);
    let size = bytes;
    let unitIndex = 0;
    while (stryMutAct_9fa48("200") ? size >= 1024 || unitIndex < units.length - 1 : stryMutAct_9fa48("199") ? false : (stryCov_9fa48("199", "200"), (stryMutAct_9fa48("203") ? size < 1024 : stryMutAct_9fa48("202") ? size > 1024 : stryMutAct_9fa48("201") ? true : (stryCov_9fa48("201", "202", "203"), size >= 1024)) && (stryMutAct_9fa48("206") ? unitIndex >= units.length - 1 : stryMutAct_9fa48("205") ? unitIndex <= units.length - 1 : stryMutAct_9fa48("204") ? true : (stryCov_9fa48("204", "205", "206"), unitIndex < (stryMutAct_9fa48("207") ? units.length + 1 : (stryCov_9fa48("207"), units.length - 1)))))) {
      if (stryMutAct_9fa48("208")) {
        {}
      } else {
        stryCov_9fa48("208");
        stryMutAct_9fa48("209") ? size *= 1024 : (stryCov_9fa48("209"), size /= 1024);
        stryMutAct_9fa48("210") ? unitIndex-- : (stryCov_9fa48("210"), unitIndex++);
      }
    }

    // Use specific unit strings to avoid object injection
    switch (unitIndex) {
      case 0:
        if (stryMutAct_9fa48("211")) {} else {
          stryCov_9fa48("211");
          return stryMutAct_9fa48("212") ? `` : (stryCov_9fa48("212"), `${size.toFixed(1)} B`);
        }
      case 1:
        if (stryMutAct_9fa48("213")) {} else {
          stryCov_9fa48("213");
          return stryMutAct_9fa48("214") ? `` : (stryCov_9fa48("214"), `${size.toFixed(1)} KB`);
        }
      case 2:
        if (stryMutAct_9fa48("215")) {} else {
          stryCov_9fa48("215");
          return stryMutAct_9fa48("216") ? `` : (stryCov_9fa48("216"), `${size.toFixed(1)} MB`);
        }
      case 3:
        if (stryMutAct_9fa48("217")) {} else {
          stryCov_9fa48("217");
          return stryMutAct_9fa48("218") ? `` : (stryCov_9fa48("218"), `${size.toFixed(1)} GB`);
        }
      case 4:
        if (stryMutAct_9fa48("219")) {} else {
          stryCov_9fa48("219");
          return stryMutAct_9fa48("220") ? `` : (stryCov_9fa48("220"), `${size.toFixed(1)} TB`);
        }
      default:
        if (stryMutAct_9fa48("221")) {} else {
          stryCov_9fa48("221");
          return stryMutAct_9fa48("222") ? `` : (stryCov_9fa48("222"), `${size.toFixed(1)} B`);
        }
    }
  }
}