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
import fp from 'fastify-plugin';
import { z } from 'zod';
const EnvSchema = z.object(
  stryMutAct_9fa48('0')
    ? {}
    : (stryCov_9fa48('0'),
      {
        NODE_ENV: z
          .enum(
            stryMutAct_9fa48('1')
              ? []
              : (stryCov_9fa48('1'),
                [
                  stryMutAct_9fa48('2')
                    ? ''
                    : (stryCov_9fa48('2'), 'development'),
                  stryMutAct_9fa48('3')
                    ? ''
                    : (stryCov_9fa48('3'), 'production'),
                  stryMutAct_9fa48('4') ? '' : (stryCov_9fa48('4'), 'test'),
                ]),
            stryMutAct_9fa48('5')
              ? {}
              : (stryCov_9fa48('5'),
                {
                  errorMap: stryMutAct_9fa48('6')
                    ? () => undefined
                    : (stryCov_9fa48('6'),
                      () =>
                        stryMutAct_9fa48('7')
                          ? {}
                          : (stryCov_9fa48('7'),
                            {
                              message: stryMutAct_9fa48('8')
                                ? ''
                                : (stryCov_9fa48('8'),
                                  'NODE_ENV must be one of: development, production, test'),
                            })),
                })
          )
          .default(
            stryMutAct_9fa48('9') ? '' : (stryCov_9fa48('9'), 'development')
          ),
        PORT: z
          .string(
            stryMutAct_9fa48('10')
              ? {}
              : (stryCov_9fa48('10'),
                {
                  required_error: stryMutAct_9fa48('11')
                    ? ''
                    : (stryCov_9fa48('11'),
                      'PORT environment variable is required'),
                  invalid_type_error: stryMutAct_9fa48('12')
                    ? ''
                    : (stryCov_9fa48('12'), 'PORT must be a string'),
                })
          )
          .regex(
            stryMutAct_9fa48('16')
              ? /^\D+$/
              : stryMutAct_9fa48('15')
                ? /^\d$/
                : stryMutAct_9fa48('14')
                  ? /^\d+/
                  : stryMutAct_9fa48('13')
                    ? /\d+$/
                    : (stryCov_9fa48('13', '14', '15', '16'), /^\d+$/),
            stryMutAct_9fa48('17')
              ? ''
              : (stryCov_9fa48('17'),
                'PORT must contain only numeric characters')
          )
          .transform(Number)
          .refine(
            stryMutAct_9fa48('18')
              ? () => undefined
              : (stryCov_9fa48('18'),
                n =>
                  stryMutAct_9fa48('21')
                    ? n > 0 || n < 65536
                    : stryMutAct_9fa48('20')
                      ? false
                      : stryMutAct_9fa48('19')
                        ? true
                        : (stryCov_9fa48('19', '20', '21'),
                          (stryMutAct_9fa48('24')
                            ? n <= 0
                            : stryMutAct_9fa48('23')
                              ? n >= 0
                              : stryMutAct_9fa48('22')
                                ? true
                                : (stryCov_9fa48('22', '23', '24'), n > 0)) &&
                            (stryMutAct_9fa48('27')
                              ? n >= 65536
                              : stryMutAct_9fa48('26')
                                ? n <= 65536
                                : stryMutAct_9fa48('25')
                                  ? true
                                  : (stryCov_9fa48('25', '26', '27'),
                                    n < 65536)))),
            stryMutAct_9fa48('28')
              ? ''
              : (stryCov_9fa48('28'), 'PORT must be between 1-65535')
          )
          .default(stryMutAct_9fa48('29') ? '' : (stryCov_9fa48('29'), '3000')),
        HOST: stryMutAct_9fa48('30')
          ? z
              .string({
                invalid_type_error: 'HOST must be a string',
              })
              .max(1, 'HOST cannot be empty')
              .default('localhost')
          : (stryCov_9fa48('30'),
            z
              .string(
                stryMutAct_9fa48('31')
                  ? {}
                  : (stryCov_9fa48('31'),
                    {
                      invalid_type_error: stryMutAct_9fa48('32')
                        ? ''
                        : (stryCov_9fa48('32'), 'HOST must be a string'),
                    })
              )
              .min(
                1,
                stryMutAct_9fa48('33')
                  ? ''
                  : (stryCov_9fa48('33'), 'HOST cannot be empty')
              )
              .default(
                stryMutAct_9fa48('34') ? '' : (stryCov_9fa48('34'), 'localhost')
              )),
        LOG_LEVEL: z
          .enum(
            stryMutAct_9fa48('35')
              ? []
              : (stryCov_9fa48('35'),
                [
                  stryMutAct_9fa48('36') ? '' : (stryCov_9fa48('36'), 'fatal'),
                  stryMutAct_9fa48('37') ? '' : (stryCov_9fa48('37'), 'error'),
                  stryMutAct_9fa48('38') ? '' : (stryCov_9fa48('38'), 'warn'),
                  stryMutAct_9fa48('39') ? '' : (stryCov_9fa48('39'), 'info'),
                  stryMutAct_9fa48('40') ? '' : (stryCov_9fa48('40'), 'debug'),
                  stryMutAct_9fa48('41') ? '' : (stryCov_9fa48('41'), 'trace'),
                ]),
            stryMutAct_9fa48('42')
              ? {}
              : (stryCov_9fa48('42'),
                {
                  errorMap: stryMutAct_9fa48('43')
                    ? () => undefined
                    : (stryCov_9fa48('43'),
                      () =>
                        stryMutAct_9fa48('44')
                          ? {}
                          : (stryCov_9fa48('44'),
                            {
                              message: stryMutAct_9fa48('45')
                                ? ''
                                : (stryCov_9fa48('45'),
                                  'LOG_LEVEL must be one of: fatal, error, warn, info, debug, trace'),
                            })),
                })
          )
          .default(stryMutAct_9fa48('46') ? '' : (stryCov_9fa48('46'), 'info')),
      })
);
export type Env = z.infer<typeof EnvSchema>;

// List of sensitive environment variable patterns to redact from logs
const SENSITIVE_PATTERNS = stryMutAct_9fa48('47')
  ? []
  : (stryCov_9fa48('47'),
    [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /auth/i,
      /credential/i,
      /database_url/i,
      /connection_string/i,
    ]);
function createSafeConfig(config: Env): Record<string, unknown> {
  if (stryMutAct_9fa48('48')) {
    {
    }
  } else {
    stryCov_9fa48('48');
    const safeConfig: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(config)) {
      if (stryMutAct_9fa48('49')) {
        {
        }
      } else {
        stryCov_9fa48('49');
        const isSensitive = stryMutAct_9fa48('50')
          ? SENSITIVE_PATTERNS.every(pattern => pattern.test(key))
          : (stryCov_9fa48('50'),
            SENSITIVE_PATTERNS.some(
              stryMutAct_9fa48('51')
                ? () => undefined
                : (stryCov_9fa48('51'), pattern => pattern.test(key))
            ));
        // eslint-disable-next-line security/detect-object-injection
        safeConfig[key] = isSensitive
          ? stryMutAct_9fa48('52')
            ? ''
            : (stryCov_9fa48('52'), '[REDACTED]')
          : value;
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
export default fp(
  fastify => {
    if (stryMutAct_9fa48('53')) {
      {
      }
    } else {
      stryCov_9fa48('53');
      try {
        if (stryMutAct_9fa48('54')) {
          {
          }
        } else {
          stryCov_9fa48('54');
          const config = EnvSchema.parse(process.env);
          fastify.decorate(
            stryMutAct_9fa48('55') ? '' : (stryCov_9fa48('55'), 'config'),
            config
          );

          // Log safe config (sensitive fields redacted)
          const safeConfig = createSafeConfig(config);
          fastify.log.info(
            stryMutAct_9fa48('56')
              ? {}
              : (stryCov_9fa48('56'),
                {
                  config: safeConfig,
                }),
            stryMutAct_9fa48('57')
              ? ''
              : (stryCov_9fa48('57'), 'Environment configuration loaded')
          );
        }
      } catch (error) {
        if (stryMutAct_9fa48('58')) {
          {
          }
        } else {
          stryCov_9fa48('58');
          if (
            stryMutAct_9fa48('60')
              ? false
              : stryMutAct_9fa48('59')
                ? true
                : (stryCov_9fa48('59', '60'), error instanceof z.ZodError)
          ) {
            if (stryMutAct_9fa48('61')) {
              {
              }
            } else {
              stryCov_9fa48('61');
              const formattedErrors = error.errors.map(
                stryMutAct_9fa48('62')
                  ? () => undefined
                  : (stryCov_9fa48('62'),
                    err =>
                      stryMutAct_9fa48('63')
                        ? {}
                        : (stryCov_9fa48('63'),
                          {
                            field: err.path.join(
                              stryMutAct_9fa48('64')
                                ? ''
                                : (stryCov_9fa48('64'), '.')
                            ),
                            message: err.message,
                            code: err.code,
                            received:
                              (stryMutAct_9fa48('65')
                                ? ''
                                : (stryCov_9fa48('65'), 'received')) in err
                                ? err.received
                                : undefined,
                          }))
              );
              fastify.log.error(
                stryMutAct_9fa48('66')
                  ? {}
                  : (stryCov_9fa48('66'),
                    {
                      validationErrors: formattedErrors,
                    }),
                stryMutAct_9fa48('67')
                  ? ''
                  : (stryCov_9fa48('67'), 'Environment validation failed')
              );
              throw new Error(
                stryMutAct_9fa48('68')
                  ? ``
                  : (stryCov_9fa48('68'),
                    `Environment validation failed: ${formattedErrors.map(stryMutAct_9fa48('69') ? () => undefined : (stryCov_9fa48('69'), e => (stryMutAct_9fa48('70') ? `` : (stryCov_9fa48('70'), `${e.field}: ${e.message}`)))).join(stryMutAct_9fa48('71') ? '' : (stryCov_9fa48('71'), ', '))}`)
              );
            }
          }
          fastify.log.error(
            stryMutAct_9fa48('72')
              ? {}
              : (stryCov_9fa48('72'),
                {
                  error,
                }),
            stryMutAct_9fa48('73')
              ? ''
              : (stryCov_9fa48('73'), 'Invalid environment configuration')
          );
          throw error;
        }
      }
    }
  },
  stryMutAct_9fa48('74')
    ? {}
    : (stryCov_9fa48('74'),
      {
        name: stryMutAct_9fa48('75') ? '' : (stryCov_9fa48('75'), 'env-plugin'),
      })
);
