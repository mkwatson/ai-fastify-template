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
import type { FastifyPluginAsync } from 'fastify';
const root: FastifyPluginAsync =
// eslint-disable-next-line require-await
async (fastify, _opts): Promise<void> => {
  if (stryMutAct_9fa48("92")) {
    {}
  } else {
    stryCov_9fa48("92");
    fastify.get(stryMutAct_9fa48("93") ? "" : (stryCov_9fa48("93"), '/'), // eslint-disable-next-line require-await
    stryMutAct_9fa48("94") ? () => undefined : (stryCov_9fa48("94"), async (_request, _reply) => stryMutAct_9fa48("95") ? {} : (stryCov_9fa48("95"), {
      message: stryMutAct_9fa48("96") ? "" : (stryCov_9fa48("96"), 'Hello World!')
    })));
  }
};
export default root;