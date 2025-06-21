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
import fp from 'fastify-plugin';
import { z } from 'zod';
const EnvSchema = z.object(stryMutAct_9fa48("7") ? {} : (stryCov_9fa48("7"), {
  NODE_ENV: z.enum(stryMutAct_9fa48("8") ? [] : (stryCov_9fa48("8"), [stryMutAct_9fa48("9") ? "" : (stryCov_9fa48("9"), 'development'), stryMutAct_9fa48("10") ? "" : (stryCov_9fa48("10"), 'production'), stryMutAct_9fa48("11") ? "" : (stryCov_9fa48("11"), 'test')]), stryMutAct_9fa48("12") ? {} : (stryCov_9fa48("12"), {
    errorMap: stryMutAct_9fa48("13") ? () => undefined : (stryCov_9fa48("13"), () => stryMutAct_9fa48("14") ? {} : (stryCov_9fa48("14"), {
      message: stryMutAct_9fa48("15") ? "" : (stryCov_9fa48("15"), 'NODE_ENV must be one of: development, production, test')
    }))
  })).default(stryMutAct_9fa48("16") ? "" : (stryCov_9fa48("16"), 'development')),
  PORT: z.string(stryMutAct_9fa48("17") ? {} : (stryCov_9fa48("17"), {
    required_error: stryMutAct_9fa48("18") ? "" : (stryCov_9fa48("18"), 'PORT environment variable is required'),
    invalid_type_error: stryMutAct_9fa48("19") ? "" : (stryCov_9fa48("19"), 'PORT must be a string')
  })).regex(stryMutAct_9fa48("23") ? /^\D+$/ : stryMutAct_9fa48("22") ? /^\d$/ : stryMutAct_9fa48("21") ? /^\d+/ : stryMutAct_9fa48("20") ? /\d+$/ : (stryCov_9fa48("20", "21", "22", "23"), /^\d+$/), stryMutAct_9fa48("24") ? "" : (stryCov_9fa48("24"), 'PORT must contain only numeric characters')).transform(Number).refine(stryMutAct_9fa48("25") ? () => undefined : (stryCov_9fa48("25"), n => stryMutAct_9fa48("28") ? n > 0 || n < 65536 : stryMutAct_9fa48("27") ? false : stryMutAct_9fa48("26") ? true : (stryCov_9fa48("26", "27", "28"), (stryMutAct_9fa48("31") ? n <= 0 : stryMutAct_9fa48("30") ? n >= 0 : stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29", "30", "31"), n > 0)) && (stryMutAct_9fa48("34") ? n >= 65536 : stryMutAct_9fa48("33") ? n <= 65536 : stryMutAct_9fa48("32") ? true : (stryCov_9fa48("32", "33", "34"), n < 65536)))), stryMutAct_9fa48("35") ? "" : (stryCov_9fa48("35"), 'PORT must be between 1-65535')).default(stryMutAct_9fa48("36") ? "" : (stryCov_9fa48("36"), '3000')),
  HOST: stryMutAct_9fa48("37") ? z.string({
    invalid_type_error: 'HOST must be a string'
  }).max(1, 'HOST cannot be empty').default('localhost') : (stryCov_9fa48("37"), z.string(stryMutAct_9fa48("38") ? {} : (stryCov_9fa48("38"), {
    invalid_type_error: stryMutAct_9fa48("39") ? "" : (stryCov_9fa48("39"), 'HOST must be a string')
  })).min(1, stryMutAct_9fa48("40") ? "" : (stryCov_9fa48("40"), 'HOST cannot be empty')).default(stryMutAct_9fa48("41") ? "" : (stryCov_9fa48("41"), 'localhost'))),
  LOG_LEVEL: z.enum(stryMutAct_9fa48("42") ? [] : (stryCov_9fa48("42"), [stryMutAct_9fa48("43") ? "" : (stryCov_9fa48("43"), 'fatal'), stryMutAct_9fa48("44") ? "" : (stryCov_9fa48("44"), 'error'), stryMutAct_9fa48("45") ? "" : (stryCov_9fa48("45"), 'warn'), stryMutAct_9fa48("46") ? "" : (stryCov_9fa48("46"), 'info'), stryMutAct_9fa48("47") ? "" : (stryCov_9fa48("47"), 'debug'), stryMutAct_9fa48("48") ? "" : (stryCov_9fa48("48"), 'trace')]), stryMutAct_9fa48("49") ? {} : (stryCov_9fa48("49"), {
    errorMap: stryMutAct_9fa48("50") ? () => undefined : (stryCov_9fa48("50"), () => stryMutAct_9fa48("51") ? {} : (stryCov_9fa48("51"), {
      message: stryMutAct_9fa48("52") ? "" : (stryCov_9fa48("52"), 'LOG_LEVEL must be one of: fatal, error, warn, info, debug, trace')
    }))
  })).default(stryMutAct_9fa48("53") ? "" : (stryCov_9fa48("53"), 'info'))
}));
export type Env = z.infer<typeof EnvSchema>;

// List of sensitive environment variable patterns to redact from logs
const SENSITIVE_PATTERNS = stryMutAct_9fa48("54") ? [] : (stryCov_9fa48("54"), [/password/i, /secret/i, /key/i, /token/i, /auth/i, /credential/i, /database_url/i, /connection_string/i]);
function createSafeConfig(config: Env): Record<string, unknown> {
  if (stryMutAct_9fa48("55")) {
    {}
  } else {
    stryCov_9fa48("55");
    const safeConfig: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(config)) {
      if (stryMutAct_9fa48("56")) {
        {}
      } else {
        stryCov_9fa48("56");
        const isSensitive = stryMutAct_9fa48("57") ? SENSITIVE_PATTERNS.every(pattern => pattern.test(key)) : (stryCov_9fa48("57"), SENSITIVE_PATTERNS.some(stryMutAct_9fa48("58") ? () => undefined : (stryCov_9fa48("58"), pattern => pattern.test(key))));
        // eslint-disable-next-line security/detect-object-injection
        safeConfig[key] = isSensitive ? stryMutAct_9fa48("59") ? "" : (stryCov_9fa48("59"), '[REDACTED]') : value;
      }
    }
    return safeConfig;
  }
}
declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}
export default fp(fastify => {
  if (stryMutAct_9fa48("60")) {
    {}
  } else {
    stryCov_9fa48("60");
    try {
      if (stryMutAct_9fa48("61")) {
        {}
      } else {
        stryCov_9fa48("61");
        const config = EnvSchema.parse(process.env);
        fastify.decorate(stryMutAct_9fa48("62") ? "" : (stryCov_9fa48("62"), 'config'), config);

        // Log safe config (sensitive fields redacted)
        const safeConfig = createSafeConfig(config);
        fastify.log.info(stryMutAct_9fa48("63") ? {} : (stryCov_9fa48("63"), {
          config: safeConfig
        }), stryMutAct_9fa48("64") ? "" : (stryCov_9fa48("64"), 'Environment configuration loaded'));
      }
    } catch (error) {
      if (stryMutAct_9fa48("65")) {
        {}
      } else {
        stryCov_9fa48("65");
        if (stryMutAct_9fa48("67") ? false : stryMutAct_9fa48("66") ? true : (stryCov_9fa48("66", "67"), error instanceof z.ZodError)) {
          if (stryMutAct_9fa48("68")) {
            {}
          } else {
            stryCov_9fa48("68");
            const formattedErrors = error.errors.map(stryMutAct_9fa48("69") ? () => undefined : (stryCov_9fa48("69"), err => stryMutAct_9fa48("70") ? {} : (stryCov_9fa48("70"), {
              field: err.path.join(stryMutAct_9fa48("71") ? "" : (stryCov_9fa48("71"), '.')),
              message: err.message,
              code: err.code,
              received: (stryMutAct_9fa48("72") ? "" : (stryCov_9fa48("72"), 'received')) in err ? err.received : undefined
            })));
            fastify.log.error(stryMutAct_9fa48("73") ? {} : (stryCov_9fa48("73"), {
              validationErrors: formattedErrors
            }), stryMutAct_9fa48("74") ? "" : (stryCov_9fa48("74"), 'Environment validation failed'));
            throw new Error(stryMutAct_9fa48("75") ? `` : (stryCov_9fa48("75"), `Environment validation failed: ${formattedErrors.map(stryMutAct_9fa48("76") ? () => undefined : (stryCov_9fa48("76"), e => stryMutAct_9fa48("77") ? `` : (stryCov_9fa48("77"), `${e.field}: ${e.message}`))).join(stryMutAct_9fa48("78") ? "" : (stryCov_9fa48("78"), ', '))}`));
          }
        }
        fastify.log.error(stryMutAct_9fa48("79") ? {} : (stryCov_9fa48("79"), {
          error
        }), stryMutAct_9fa48("80") ? "" : (stryCov_9fa48("80"), 'Invalid environment configuration'));
        throw error;
      }
    }
  }
}, stryMutAct_9fa48("81") ? {} : (stryCov_9fa48("81"), {
  name: stryMutAct_9fa48("82") ? "" : (stryCov_9fa48("82"), 'env-plugin')
}));