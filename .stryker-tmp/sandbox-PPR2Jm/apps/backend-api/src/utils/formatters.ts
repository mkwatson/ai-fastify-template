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

// Zod schemas for validation
export const CurrencySchema = z.enum(
  stryMutAct_9fa48('127')
    ? []
    : (stryCov_9fa48('127'),
      [
        stryMutAct_9fa48('128') ? '' : (stryCov_9fa48('128'), 'USD'),
        stryMutAct_9fa48('129') ? '' : (stryCov_9fa48('129'), 'EUR'),
        stryMutAct_9fa48('130') ? '' : (stryCov_9fa48('130'), 'GBP'),
        stryMutAct_9fa48('131') ? '' : (stryCov_9fa48('131'), 'JPY'),
      ])
);
export const LocaleSchema = stryMutAct_9fa48('132')
  ? z.string().max(2)
  : (stryCov_9fa48('132'), z.string().min(2));
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Format currency with proper locale and currency code validation
 */
export function formatCurrency(
  amount: number,
  currency: Currency = stryMutAct_9fa48('133')
    ? ''
    : (stryCov_9fa48('133'), 'USD'),
  locale: string = stryMutAct_9fa48('134')
    ? ''
    : (stryCov_9fa48('134'), 'en-US')
): string {
  if (stryMutAct_9fa48('135')) {
    {
    }
  } else {
    stryCov_9fa48('135');
    // Validate inputs
    CurrencySchema.parse(currency);
    LocaleSchema.parse(locale);
    if (
      stryMutAct_9fa48('138')
        ? false
        : stryMutAct_9fa48('137')
          ? true
          : stryMutAct_9fa48('136')
            ? Number.isFinite(amount)
            : (stryCov_9fa48('136', '137', '138'), !Number.isFinite(amount))
    ) {
      if (stryMutAct_9fa48('139')) {
        {
        }
      } else {
        stryCov_9fa48('139');
        throw new Error(
          stryMutAct_9fa48('140')
            ? ''
            : (stryCov_9fa48('140'), 'Amount must be a finite number')
        );
      }
    }
    return new Intl.NumberFormat(
      locale,
      stryMutAct_9fa48('141')
        ? {}
        : (stryCov_9fa48('141'),
          {
            style: stryMutAct_9fa48('142')
              ? ''
              : (stryCov_9fa48('142'), 'currency'),
            currency,
          })
    ).format(amount);
  }
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (stryMutAct_9fa48('143')) {
    {
    }
  } else {
    stryCov_9fa48('143');
    if (
      stryMutAct_9fa48('146')
        ? false
        : stryMutAct_9fa48('145')
          ? true
          : stryMutAct_9fa48('144')
            ? Number.isFinite(value)
            : (stryCov_9fa48('144', '145', '146'), !Number.isFinite(value))
    ) {
      if (stryMutAct_9fa48('147')) {
        {
        }
      } else {
        stryCov_9fa48('147');
        throw new Error(
          stryMutAct_9fa48('148')
            ? ''
            : (stryCov_9fa48('148'), 'Value must be a finite number')
        );
      }
    }
    if (
      stryMutAct_9fa48('151')
        ? decimals < 0 && decimals > 10
        : stryMutAct_9fa48('150')
          ? false
          : stryMutAct_9fa48('149')
            ? true
            : (stryCov_9fa48('149', '150', '151'),
              (stryMutAct_9fa48('154')
                ? decimals >= 0
                : stryMutAct_9fa48('153')
                  ? decimals <= 0
                  : stryMutAct_9fa48('152')
                    ? false
                    : (stryCov_9fa48('152', '153', '154'), decimals < 0)) ||
                (stryMutAct_9fa48('157')
                  ? decimals <= 10
                  : stryMutAct_9fa48('156')
                    ? decimals >= 10
                    : stryMutAct_9fa48('155')
                      ? false
                      : (stryCov_9fa48('155', '156', '157'), decimals > 10)))
    ) {
      if (stryMutAct_9fa48('158')) {
        {
        }
      } else {
        stryCov_9fa48('158');
        throw new Error(
          stryMutAct_9fa48('159')
            ? ''
            : (stryCov_9fa48('159'), 'Decimals must be between 0 and 10')
        );
      }
    }
    return stryMutAct_9fa48('160')
      ? ``
      : (stryCov_9fa48('160'),
        `${(stryMutAct_9fa48('161') ? value / 100 : (stryCov_9fa48('161'), value * 100)).toFixed(decimals)}%`);
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (stryMutAct_9fa48('162')) {
    {
    }
  } else {
    stryCov_9fa48('162');
    if (
      stryMutAct_9fa48('165')
        ? !Number.isInteger(bytes) && bytes < 0
        : stryMutAct_9fa48('164')
          ? false
          : stryMutAct_9fa48('163')
            ? true
            : (stryCov_9fa48('163', '164', '165'),
              (stryMutAct_9fa48('166')
                ? Number.isInteger(bytes)
                : (stryCov_9fa48('166'), !Number.isInteger(bytes))) ||
                (stryMutAct_9fa48('169')
                  ? bytes >= 0
                  : stryMutAct_9fa48('168')
                    ? bytes <= 0
                    : stryMutAct_9fa48('167')
                      ? false
                      : (stryCov_9fa48('167', '168', '169'), bytes < 0)))
    ) {
      if (stryMutAct_9fa48('170')) {
        {
        }
      } else {
        stryCov_9fa48('170');
        throw new Error(
          stryMutAct_9fa48('171')
            ? ''
            : (stryCov_9fa48('171'), 'Bytes must be a non-negative integer')
        );
      }
    }
    const units = stryMutAct_9fa48('172')
      ? []
      : (stryCov_9fa48('172'),
        [
          stryMutAct_9fa48('173') ? '' : (stryCov_9fa48('173'), 'B'),
          stryMutAct_9fa48('174') ? '' : (stryCov_9fa48('174'), 'KB'),
          stryMutAct_9fa48('175') ? '' : (stryCov_9fa48('175'), 'MB'),
          stryMutAct_9fa48('176') ? '' : (stryCov_9fa48('176'), 'GB'),
          stryMutAct_9fa48('177') ? '' : (stryCov_9fa48('177'), 'TB'),
        ]);
    let size = bytes;
    let unitIndex = 0;
    while (
      stryMutAct_9fa48('179')
        ? size >= 1024 || unitIndex < units.length - 1
        : stryMutAct_9fa48('178')
          ? false
          : (stryCov_9fa48('178', '179'),
            (stryMutAct_9fa48('182')
              ? size < 1024
              : stryMutAct_9fa48('181')
                ? size > 1024
                : stryMutAct_9fa48('180')
                  ? true
                  : (stryCov_9fa48('180', '181', '182'), size >= 1024)) &&
              (stryMutAct_9fa48('185')
                ? unitIndex >= units.length - 1
                : stryMutAct_9fa48('184')
                  ? unitIndex <= units.length - 1
                  : stryMutAct_9fa48('183')
                    ? true
                    : (stryCov_9fa48('183', '184', '185'),
                      unitIndex <
                        (stryMutAct_9fa48('186')
                          ? units.length + 1
                          : (stryCov_9fa48('186'), units.length - 1)))))
    ) {
      if (stryMutAct_9fa48('187')) {
        {
        }
      } else {
        stryCov_9fa48('187');
        stryMutAct_9fa48('188')
          ? (size *= 1024)
          : (stryCov_9fa48('188'), (size /= 1024));
        stryMutAct_9fa48('189')
          ? unitIndex--
          : (stryCov_9fa48('189'), unitIndex++);
      }
    }

    // Use specific unit strings to avoid object injection
    switch (unitIndex) {
      case 0:
        if (stryMutAct_9fa48('190')) {
        } else {
          stryCov_9fa48('190');
          return stryMutAct_9fa48('191')
            ? ``
            : (stryCov_9fa48('191'), `${size.toFixed(1)} B`);
        }
      case 1:
        if (stryMutAct_9fa48('192')) {
        } else {
          stryCov_9fa48('192');
          return stryMutAct_9fa48('193')
            ? ``
            : (stryCov_9fa48('193'), `${size.toFixed(1)} KB`);
        }
      case 2:
        if (stryMutAct_9fa48('194')) {
        } else {
          stryCov_9fa48('194');
          return stryMutAct_9fa48('195')
            ? ``
            : (stryCov_9fa48('195'), `${size.toFixed(1)} MB`);
        }
      case 3:
        if (stryMutAct_9fa48('196')) {
        } else {
          stryCov_9fa48('196');
          return stryMutAct_9fa48('197')
            ? ``
            : (stryCov_9fa48('197'), `${size.toFixed(1)} GB`);
        }
      case 4:
        if (stryMutAct_9fa48('198')) {
        } else {
          stryCov_9fa48('198');
          return stryMutAct_9fa48('199')
            ? ``
            : (stryCov_9fa48('199'), `${size.toFixed(1)} TB`);
        }
      default:
        if (stryMutAct_9fa48('200')) {
        } else {
          stryCov_9fa48('200');
          return stryMutAct_9fa48('201')
            ? ``
            : (stryCov_9fa48('201'), `${size.toFixed(1)} B`);
        }
    }
  }
}
