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

/**
 * Email validation with proper regex and Zod schema
 */
export const EmailSchema = z
  .string()
  .email(
    stryMutAct_9fa48('202')
      ? ''
      : (stryCov_9fa48('202'), 'Invalid email format')
  );
export function isValidEmail(email: string): boolean {
  if (stryMutAct_9fa48('203')) {
    {
    }
  } else {
    stryCov_9fa48('203');
    try {
      if (stryMutAct_9fa48('204')) {
        {
        }
      } else {
        stryCov_9fa48('204');
        EmailSchema.parse(email);
        return stryMutAct_9fa48('205') ? false : (stryCov_9fa48('205'), true);
      }
    } catch {
      if (stryMutAct_9fa48('206')) {
        {
        }
      } else {
        stryCov_9fa48('206');
        return stryMutAct_9fa48('207') ? true : (stryCov_9fa48('207'), false);
      }
    }
  }
}

/**
 * URL validation with Zod schema
 */
export const UrlSchema = z
  .string()
  .url(
    stryMutAct_9fa48('208') ? '' : (stryCov_9fa48('208'), 'Invalid URL format')
  );
export function isValidUrl(url: string): boolean {
  if (stryMutAct_9fa48('209')) {
    {
    }
  } else {
    stryCov_9fa48('209');
    try {
      if (stryMutAct_9fa48('210')) {
        {
        }
      } else {
        stryCov_9fa48('210');
        UrlSchema.parse(url);
        return stryMutAct_9fa48('211') ? false : (stryCov_9fa48('211'), true);
      }
    } catch {
      if (stryMutAct_9fa48('212')) {
        {
        }
      } else {
        stryCov_9fa48('212');
        return stryMutAct_9fa48('213') ? true : (stryCov_9fa48('213'), false);
      }
    }
  }
}

/**
 * Phone number validation (simple US format)
 */
export const PhoneSchema = z
  .string()
  .regex(
    stryMutAct_9fa48('234')
      ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([^0-9]{4})$/
      : stryMutAct_9fa48('233')
        ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9])$/
        : stryMutAct_9fa48('232')
          ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\S]?([0-9]{4})$/
          : stryMutAct_9fa48('231')
            ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[^-.\s]?([0-9]{4})$/
            : stryMutAct_9fa48('230')
              ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]([0-9]{4})$/
              : stryMutAct_9fa48('229')
                ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([^0-9]{3})[-.\s]?([0-9]{4})$/
                : stryMutAct_9fa48('228')
                  ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9])[-.\s]?([0-9]{4})$/
                  : stryMutAct_9fa48('227')
                    ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\S]?([0-9]{3})[-.\s]?([0-9]{4})$/
                    : stryMutAct_9fa48('226')
                      ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[^-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                      : stryMutAct_9fa48('225')
                        ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]([0-9]{3})[-.\s]?([0-9]{4})$/
                        : stryMutAct_9fa48('224')
                          ? /^\+?1?[-.\s]?\(?([0-9]{3})\)[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                          : stryMutAct_9fa48('223')
                            ? /^\+?1?[-.\s]?\(?([^0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                            : stryMutAct_9fa48('222')
                              ? /^\+?1?[-.\s]?\(?([0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                              : stryMutAct_9fa48('221')
                                ? /^\+?1?[-.\s]?\(([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                                : stryMutAct_9fa48('220')
                                  ? /^\+?1?[-.\S]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                                  : stryMutAct_9fa48('219')
                                    ? /^\+?1?[^-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                                    : stryMutAct_9fa48('218')
                                      ? /^\+?1?[-.\s]\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                                      : stryMutAct_9fa48('217')
                                        ? /^\+?1[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                                        : stryMutAct_9fa48('216')
                                          ? /^\+1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                                          : stryMutAct_9fa48('215')
                                            ? /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/
                                            : stryMutAct_9fa48('214')
                                              ? /\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
                                              : (stryCov_9fa48(
                                                  '214',
                                                  '215',
                                                  '216',
                                                  '217',
                                                  '218',
                                                  '219',
                                                  '220',
                                                  '221',
                                                  '222',
                                                  '223',
                                                  '224',
                                                  '225',
                                                  '226',
                                                  '227',
                                                  '228',
                                                  '229',
                                                  '230',
                                                  '231',
                                                  '232',
                                                  '233',
                                                  '234'
                                                ),
                                                /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/),
    stryMutAct_9fa48('235')
      ? ''
      : (stryCov_9fa48('235'), 'Invalid phone number format')
  );
export function isValidPhoneNumber(phone: string): boolean {
  if (stryMutAct_9fa48('236')) {
    {
    }
  } else {
    stryCov_9fa48('236');
    try {
      if (stryMutAct_9fa48('237')) {
        {
        }
      } else {
        stryCov_9fa48('237');
        PhoneSchema.parse(phone);
        return stryMutAct_9fa48('238') ? false : (stryCov_9fa48('238'), true);
      }
    } catch {
      if (stryMutAct_9fa48('239')) {
        {
        }
      } else {
        stryCov_9fa48('239');
        return stryMutAct_9fa48('240') ? true : (stryCov_9fa48('240'), false);
      }
    }
  }
}

/**
 * Password strength validation
 */
export const PasswordSchema = stryMutAct_9fa48('241')
  ? z
      .string()
      .max(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      )
  : (stryCov_9fa48('241'),
    z
      .string()
      .min(
        8,
        stryMutAct_9fa48('242')
          ? ''
          : (stryCov_9fa48('242'), 'Password must be at least 8 characters')
      )
      .regex(
        stryMutAct_9fa48('243') ? /[^A-Z]/ : (stryCov_9fa48('243'), /[A-Z]/),
        stryMutAct_9fa48('244')
          ? ''
          : (stryCov_9fa48('244'),
            'Password must contain at least one uppercase letter')
      )
      .regex(
        stryMutAct_9fa48('245') ? /[^a-z]/ : (stryCov_9fa48('245'), /[a-z]/),
        stryMutAct_9fa48('246')
          ? ''
          : (stryCov_9fa48('246'),
            'Password must contain at least one lowercase letter')
      )
      .regex(
        stryMutAct_9fa48('247') ? /[^0-9]/ : (stryCov_9fa48('247'), /[0-9]/),
        stryMutAct_9fa48('248')
          ? ''
          : (stryCov_9fa48('248'), 'Password must contain at least one number')
      )
      .regex(
        stryMutAct_9fa48('249')
          ? /[A-Za-z0-9]/
          : (stryCov_9fa48('249'), /[^A-Za-z0-9]/),
        stryMutAct_9fa48('250')
          ? ''
          : (stryCov_9fa48('250'),
            'Password must contain at least one special character')
      ));
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  if (stryMutAct_9fa48('251')) {
    {
    }
  } else {
    stryCov_9fa48('251');
    try {
      if (stryMutAct_9fa48('252')) {
        {
        }
      } else {
        stryCov_9fa48('252');
        PasswordSchema.parse(password);
        return stryMutAct_9fa48('253')
          ? {}
          : (stryCov_9fa48('253'),
            {
              isValid: stryMutAct_9fa48('254')
                ? false
                : (stryCov_9fa48('254'), true),
              errors: stryMutAct_9fa48('255')
                ? ['Stryker was here']
                : (stryCov_9fa48('255'), []),
            });
      }
    } catch (error) {
      if (stryMutAct_9fa48('256')) {
        {
        }
      } else {
        stryCov_9fa48('256');
        if (
          stryMutAct_9fa48('258')
            ? false
            : stryMutAct_9fa48('257')
              ? true
              : (stryCov_9fa48('257', '258'), error instanceof z.ZodError)
        ) {
          if (stryMutAct_9fa48('259')) {
            {
            }
          } else {
            stryCov_9fa48('259');
            return stryMutAct_9fa48('260')
              ? {}
              : (stryCov_9fa48('260'),
                {
                  isValid: stryMutAct_9fa48('261')
                    ? true
                    : (stryCov_9fa48('261'), false),
                  errors: error.errors.map(
                    stryMutAct_9fa48('262')
                      ? () => undefined
                      : (stryCov_9fa48('262'), err => err.message)
                  ),
                });
          }
        }
        return stryMutAct_9fa48('263')
          ? {}
          : (stryCov_9fa48('263'),
            {
              isValid: stryMutAct_9fa48('264')
                ? true
                : (stryCov_9fa48('264'), false),
              errors: stryMutAct_9fa48('265')
                ? []
                : (stryCov_9fa48('265'),
                  [
                    stryMutAct_9fa48('266')
                      ? ''
                      : (stryCov_9fa48('266'), 'Unknown validation error'),
                  ]),
            });
      }
    }
  }
}
