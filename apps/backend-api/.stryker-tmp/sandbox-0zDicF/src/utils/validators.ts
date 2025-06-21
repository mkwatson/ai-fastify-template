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

/**
 * Email validation with proper regex and Zod schema
 */
export const EmailSchema = z.string().email(stryMutAct_9fa48("223") ? "" : (stryCov_9fa48("223"), 'Invalid email format'));
export function isValidEmail(email: string): boolean {
  if (stryMutAct_9fa48("224")) {
    {}
  } else {
    stryCov_9fa48("224");
    try {
      if (stryMutAct_9fa48("225")) {
        {}
      } else {
        stryCov_9fa48("225");
        EmailSchema.parse(email);
        return stryMutAct_9fa48("226") ? false : (stryCov_9fa48("226"), true);
      }
    } catch {
      if (stryMutAct_9fa48("227")) {
        {}
      } else {
        stryCov_9fa48("227");
        return stryMutAct_9fa48("228") ? true : (stryCov_9fa48("228"), false);
      }
    }
  }
}

/**
 * URL validation with Zod schema
 */
export const UrlSchema = z.string().url(stryMutAct_9fa48("229") ? "" : (stryCov_9fa48("229"), 'Invalid URL format'));
export function isValidUrl(url: string): boolean {
  if (stryMutAct_9fa48("230")) {
    {}
  } else {
    stryCov_9fa48("230");
    try {
      if (stryMutAct_9fa48("231")) {
        {}
      } else {
        stryCov_9fa48("231");
        UrlSchema.parse(url);
        return stryMutAct_9fa48("232") ? false : (stryCov_9fa48("232"), true);
      }
    } catch {
      if (stryMutAct_9fa48("233")) {
        {}
      } else {
        stryCov_9fa48("233");
        return stryMutAct_9fa48("234") ? true : (stryCov_9fa48("234"), false);
      }
    }
  }
}

/**
 * Phone number validation (simple US format)
 */
export const PhoneSchema = z.string().regex(stryMutAct_9fa48("255") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([^0-9]{4})$/ : stryMutAct_9fa48("254") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9])$/ : stryMutAct_9fa48("253") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\S]?([0-9]{4})$/ : stryMutAct_9fa48("252") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[^-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("251") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]([0-9]{4})$/ : stryMutAct_9fa48("250") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([^0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("249") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9])[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("248") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\S]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("247") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[^-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("246") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("245") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("244") ? /^\+?1?[-.\s]?\(?([^0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("243") ? /^\+?1?[-.\s]?\(?([0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("242") ? /^\+?1?[-.\s]?\(([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("241") ? /^\+?1?[-.\S]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("240") ? /^\+?1?[^-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("239") ? /^\+?1?[-.\s]\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("238") ? /^\+?1[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("237") ? /^\+1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("236") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/ : stryMutAct_9fa48("235") ? /\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : (stryCov_9fa48("235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255"), /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/), stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), 'Invalid phone number format'));
export function isValidPhoneNumber(phone: string): boolean {
  if (stryMutAct_9fa48("257")) {
    {}
  } else {
    stryCov_9fa48("257");
    try {
      if (stryMutAct_9fa48("258")) {
        {}
      } else {
        stryCov_9fa48("258");
        PhoneSchema.parse(phone);
        return stryMutAct_9fa48("259") ? false : (stryCov_9fa48("259"), true);
      }
    } catch {
      if (stryMutAct_9fa48("260")) {
        {}
      } else {
        stryCov_9fa48("260");
        return stryMutAct_9fa48("261") ? true : (stryCov_9fa48("261"), false);
      }
    }
  }
}

/**
 * Password strength validation
 */
export const PasswordSchema = stryMutAct_9fa48("262") ? z.string().max(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number').regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character') : (stryCov_9fa48("262"), z.string().min(8, stryMutAct_9fa48("263") ? "" : (stryCov_9fa48("263"), 'Password must be at least 8 characters')).regex(stryMutAct_9fa48("264") ? /[^A-Z]/ : (stryCov_9fa48("264"), /[A-Z]/), stryMutAct_9fa48("265") ? "" : (stryCov_9fa48("265"), 'Password must contain at least one uppercase letter')).regex(stryMutAct_9fa48("266") ? /[^a-z]/ : (stryCov_9fa48("266"), /[a-z]/), stryMutAct_9fa48("267") ? "" : (stryCov_9fa48("267"), 'Password must contain at least one lowercase letter')).regex(stryMutAct_9fa48("268") ? /[^0-9]/ : (stryCov_9fa48("268"), /[0-9]/), stryMutAct_9fa48("269") ? "" : (stryCov_9fa48("269"), 'Password must contain at least one number')).regex(stryMutAct_9fa48("270") ? /[A-Za-z0-9]/ : (stryCov_9fa48("270"), /[^A-Za-z0-9]/), stryMutAct_9fa48("271") ? "" : (stryCov_9fa48("271"), 'Password must contain at least one special character')));
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  if (stryMutAct_9fa48("272")) {
    {}
  } else {
    stryCov_9fa48("272");
    try {
      if (stryMutAct_9fa48("273")) {
        {}
      } else {
        stryCov_9fa48("273");
        PasswordSchema.parse(password);
        return stryMutAct_9fa48("274") ? {} : (stryCov_9fa48("274"), {
          isValid: stryMutAct_9fa48("275") ? false : (stryCov_9fa48("275"), true),
          errors: stryMutAct_9fa48("276") ? ["Stryker was here"] : (stryCov_9fa48("276"), [])
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("277")) {
        {}
      } else {
        stryCov_9fa48("277");
        if (stryMutAct_9fa48("279") ? false : stryMutAct_9fa48("278") ? true : (stryCov_9fa48("278", "279"), error instanceof z.ZodError)) {
          if (stryMutAct_9fa48("280")) {
            {}
          } else {
            stryCov_9fa48("280");
            return stryMutAct_9fa48("281") ? {} : (stryCov_9fa48("281"), {
              isValid: stryMutAct_9fa48("282") ? true : (stryCov_9fa48("282"), false),
              errors: error.errors.map(stryMutAct_9fa48("283") ? () => undefined : (stryCov_9fa48("283"), err => err.message))
            });
          }
        }
        return stryMutAct_9fa48("284") ? {} : (stryCov_9fa48("284"), {
          isValid: stryMutAct_9fa48("285") ? true : (stryCov_9fa48("285"), false),
          errors: stryMutAct_9fa48("286") ? [] : (stryCov_9fa48("286"), [stryMutAct_9fa48("287") ? "" : (stryCov_9fa48("287"), 'Unknown validation error')])
        });
      }
    }
  }
}