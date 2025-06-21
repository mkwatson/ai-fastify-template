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
import Fastify from 'fastify';
import app from './app.js';
const server = Fastify(stryMutAct_9fa48("97") ? {} : (stryCov_9fa48("97"), {
  logger: stryMutAct_9fa48("98") ? {} : (stryCov_9fa48("98"), {
    level: stryMutAct_9fa48("99") ? "" : (stryCov_9fa48("99"), 'info'),
    transport: stryMutAct_9fa48("100") ? {} : (stryCov_9fa48("100"), {
      target: stryMutAct_9fa48("101") ? "" : (stryCov_9fa48("101"), 'pino-pretty')
    })
  })
}));
server.register(app);
const start = async (): Promise<void> => {
  if (stryMutAct_9fa48("102")) {
    {}
  } else {
    stryCov_9fa48("102");
    try {
      if (stryMutAct_9fa48("103")) {
        {}
      } else {
        stryCov_9fa48("103");
        await server.listen(stryMutAct_9fa48("104") ? {} : (stryCov_9fa48("104"), {
          port: 3000,
          host: stryMutAct_9fa48("105") ? "" : (stryCov_9fa48("105"), '0.0.0.0')
        }));
        server.log.info(stryMutAct_9fa48("106") ? "" : (stryCov_9fa48("106"), 'Server listening on http://localhost:3000'));
      }
    } catch (err) {
      if (stryMutAct_9fa48("107")) {
        {}
      } else {
        stryCov_9fa48("107");
        server.log.error(err);
        throw new Error(stryMutAct_9fa48("108") ? "" : (stryCov_9fa48("108"), 'Failed to start server'));
      }
    }
  }
};
start().catch(error => {
  if (stryMutAct_9fa48("109")) {
    {}
  } else {
    stryCov_9fa48("109");
    console.error(stryMutAct_9fa48("110") ? "" : (stryCov_9fa48("110"), 'Failed to start server:'), error);
    process.exit(1);
  }
});