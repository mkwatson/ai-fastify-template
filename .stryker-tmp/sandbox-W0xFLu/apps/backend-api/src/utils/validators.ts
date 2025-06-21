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
export const EmailSchema = z.string().email(stryMutAct_9fa48("119") ? "" : (stryCov_9fa48("119"), 'Invalid email format'));
export function isValidEmail(email: string): boolean {
  if (stryMutAct_9fa48("120")) {
    {}
  } else {
    stryCov_9fa48("120");
    try {
      if (stryMutAct_9fa48("121")) {
        {}
      } else {
        stryCov_9fa48("121");
        EmailSchema.parse(email);
        return stryMutAct_9fa48("122") ? false : (stryCov_9fa48("122"), true);
      }
    } catch {
      if (stryMutAct_9fa48("123")) {
        {}
      } else {
        stryCov_9fa48("123");
        return stryMutAct_9fa48("124") ? true : (stryCov_9fa48("124"), false);
      }
    }
  }
}

/**
 * URL validation with Zod schema
 */
export const UrlSchema = z.string().url(stryMutAct_9fa48("125") ? "" : (stryCov_9fa48("125"), 'Invalid URL format'));
export function isValidUrl(url: string): boolean {
  if (stryMutAct_9fa48("126")) {
    {}
  } else {
    stryCov_9fa48("126");
    try {
      if (stryMutAct_9fa48("127")) {
        {}
      } else {
        stryCov_9fa48("127");
        UrlSchema.parse(url);
        return stryMutAct_9fa48("128") ? false : (stryCov_9fa48("128"), true);
      }
    } catch {
      if (stryMutAct_9fa48("129")) {
        {}
      } else {
        stryCov_9fa48("129");
        return stryMutAct_9fa48("130") ? true : (stryCov_9fa48("130"), false);
      }
    }
  }
}

/**
 * Phone number validation (simple US format)
 */
export const PhoneSchema = z.string().regex(stryMutAct_9fa48("151") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([^0-9]{4})$/ : stryMutAct_9fa48("150") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9])$/ : stryMutAct_9fa48("149") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\S]?([0-9]{4})$/ : stryMutAct_9fa48("148") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[^-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("147") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]([0-9]{4})$/ : stryMutAct_9fa48("146") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([^0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("145") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9])[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("144") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\S]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("143") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[^-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("142") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("141") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("140") ? /^\+?1?[-.\s]?\(?([^0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("139") ? /^\+?1?[-.\s]?\(?([0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("138") ? /^\+?1?[-.\s]?\(([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("137") ? /^\+?1?[-.\S]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("136") ? /^\+?1?[^-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("135") ? /^\+?1?[-.\s]\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("134") ? /^\+?1[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("133") ? /^\+1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : stryMutAct_9fa48("132") ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/ : stryMutAct_9fa48("131") ? /\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/ : (stryCov_9fa48("131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151"), /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/), stryMutAct_9fa48("152") ? "" : (stryCov_9fa48("152"), 'Invalid phone number format'));
export function isValidPhoneNumber(phone: string): boolean {
  if (stryMutAct_9fa48("153")) {
    {}
  } else {
    stryCov_9fa48("153");
    try {
      if (stryMutAct_9fa48("154")) {
        {}
      } else {
        stryCov_9fa48("154");
        PhoneSchema.parse(phone);
        return stryMutAct_9fa48("155") ? false : (stryCov_9fa48("155"), true);
      }
    } catch {
      if (stryMutAct_9fa48("156")) {
        {}
      } else {
        stryCov_9fa48("156");
        return stryMutAct_9fa48("157") ? true : (stryCov_9fa48("157"), false);
      }
    }
  }
}

/**
 * Password strength validation
 */
export const PasswordSchema = stryMutAct_9fa48("158") ? z.string().max(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number').regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character') : (stryCov_9fa48("158"), z.string().min(8, stryMutAct_9fa48("159") ? "" : (stryCov_9fa48("159"), 'Password must be at least 8 characters')).regex(stryMutAct_9fa48("160") ? /[^A-Z]/ : (stryCov_9fa48("160"), /[A-Z]/), stryMutAct_9fa48("161") ? "" : (stryCov_9fa48("161"), 'Password must contain at least one uppercase letter')).regex(stryMutAct_9fa48("162") ? /[^a-z]/ : (stryCov_9fa48("162"), /[a-z]/), stryMutAct_9fa48("163") ? "" : (stryCov_9fa48("163"), 'Password must contain at least one lowercase letter')).regex(stryMutAct_9fa48("164") ? /[^0-9]/ : (stryCov_9fa48("164"), /[0-9]/), stryMutAct_9fa48("165") ? "" : (stryCov_9fa48("165"), 'Password must contain at least one number')).regex(stryMutAct_9fa48("166") ? /[A-Za-z0-9]/ : (stryCov_9fa48("166"), /[^A-Za-z0-9]/), stryMutAct_9fa48("167") ? "" : (stryCov_9fa48("167"), 'Password must contain at least one special character')));
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  if (stryMutAct_9fa48("168")) {
    {}
  } else {
    stryCov_9fa48("168");
    try {
      if (stryMutAct_9fa48("169")) {
        {}
      } else {
        stryCov_9fa48("169");
        PasswordSchema.parse(password);
        return stryMutAct_9fa48("170") ? {} : (stryCov_9fa48("170"), {
          isValid: stryMutAct_9fa48("171") ? false : (stryCov_9fa48("171"), true),
          errors: stryMutAct_9fa48("172") ? ["Stryker was here"] : (stryCov_9fa48("172"), [])
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("173")) {
        {}
      } else {
        stryCov_9fa48("173");
        if (stryMutAct_9fa48("175") ? false : stryMutAct_9fa48("174") ? true : (stryCov_9fa48("174", "175"), error instanceof z.ZodError)) {
          if (stryMutAct_9fa48("176")) {
            {}
          } else {
            stryCov_9fa48("176");
            return stryMutAct_9fa48("177") ? {} : (stryCov_9fa48("177"), {
              isValid: stryMutAct_9fa48("178") ? true : (stryCov_9fa48("178"), false),
              errors: error.errors.map(stryMutAct_9fa48("179") ? () => undefined : (stryCov_9fa48("179"), err => err.message))
            });
          }
        }
        return stryMutAct_9fa48("180") ? {} : (stryCov_9fa48("180"), {
          isValid: stryMutAct_9fa48("181") ? true : (stryCov_9fa48("181"), false),
          errors: stryMutAct_9fa48("182") ? [] : (stryCov_9fa48("182"), [stryMutAct_9fa48("183") ? "" : (stryCov_9fa48("183"), 'Unknown validation error')])
        });
      }
    }
  }
}