/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    /* rules from the 'recommended' preset: */
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You might want to revise ' +
        'your solution (i.e. use dependency inversion, make sure the modules have a single responsibility) ',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or " +
        "remove it. If it's logical this module is an orphan (i.e. it's a config file), " +
        'add an exception for it in your dependency-cruiser configuration. By default ' +
        'this rule does not scrutinize dot-files (e.g. .eslintrc.js), TypeScript declaration ' +
        'files (.d.ts), tsconfig.json and some of the babel and webpack configs.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dot files
          '\\.d\\.ts$', // TypeScript declaration files
          '(^|/)tsconfig\\.json$', // TypeScript config
          '(^|/)(babel|webpack)\\.config\\.(js|cjs|mjs|ts|json)$', // babel and webpack configs
          '^apps/.*/src/routes/', // Route files are entry points
          '^apps/.*/src/plugins/', // Plugin files are registered separately
          '^apps/.*/src/(server|app)\\.ts$', // Server entry points
        ],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      comment:
        'A module depends on a node core module that has been deprecated. Find an alternative - these are ' +
        "bound to exist - node doesn't deprecate lightly.",
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: [
          '^(v8/tools/codemap|v8/tools/consarray|v8/tools/csvparser|v8/tools/logreader|v8/tools/profile_view|v8/tools/splaytree|v8/tools/tickprocessor-driver|v8/tools/tickprocessor|node-inspect/lib/_inspect|node-inspect/lib/internal/inspect_client|node-inspect/lib/internal/inspect_repl|async_hooks|punycode|domain|constants|sys|_linklist|_stream_wrap)$',
        ],
      },
    },
    {
      name: 'not-to-deprecated',
      comment:
        'This module uses a (version of an) npm module that has been deprecated. Either upgrade to a later ' +
        'version of that module, or find an alternative. Deprecated modules are a security risk.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['deprecated'],
      },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. " +
        "That's problematic as the package either (1) won't be available on live (2) will be available on live " +
        'but not in the exact version you expect it to be.',
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
      },
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that cannot be found ('unresolvable'). This might be perfectly valid " +
        '(e.g. modules that are available only at runtime) or it might not be. Adjust the ' +
        'rule and its excludes to match your situation.',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'no-duplicate-dep-types',
      comment:
        "Likely this module depends on an external ('npm') package that occurs more than once " +
        'in your package.json i.e. bot as a devDependencies and in dependencies. This will cause trouble ' +
        'one way or another. Clean up your dependencies.',
      severity: 'warn',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        dependencyTypesNot: ['type-only'],
      },
    },

    /* Custom architecture rules for Fastify monorepo */
    {
      name: 'no-routes-to-routes',
      comment:
        'Route modules should not import from other route modules. This prevents tight coupling ' +
        'between different API endpoints. Use shared services or utilities instead.',
      severity: 'error',
      from: {
        path: '(^|/)routes/',
      },
      to: {
        path: '(^|/)routes/',
        pathNot: '^$1',
      },
    },
    {
      name: 'no-services-to-routes',
      comment:
        'Service modules should not import from route modules. This would create an inverted ' +
        'dependency where business logic depends on HTTP presentation layer.',
      severity: 'error',
      from: {
        path: '(^|/)services/',
      },
      to: {
        path: '(^|/)routes/',
      },
    },
    {
      name: 'no-plugins-to-routes',
      comment:
        'Plugin modules should not import from route modules. Plugins provide infrastructure ' +
        'and should not depend on specific route implementations.',
      severity: 'error',
      from: {
        path: '(^|/)plugins/',
      },
      to: {
        path: '(^|/)routes/',
      },
    },
    {
      name: 'no-utils-to-business-logic',
      comment:
        'Utility modules should not import from services or routes. Utils should be ' +
        'pure functions with minimal dependencies.',
      severity: 'error',
      from: {
        path: '(^|/)utils/',
      },
      to: {
        path: '(^|/)(routes|services|plugins)/',
      },
    },
    {
      name: 'no-cross-app-dependencies',
      comment:
        'Apps should not directly import from other apps. Use shared packages instead.',
      severity: 'error',
      from: {
        path: '^apps/([^/]+)/',
      },
      to: {
        path: '^apps/([^/]+)/',
        pathNot: '^apps/$1/',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    includeOnly: {
      path: '^(apps|packages|temp-test-violations)/',
    },
    moduleSystems: ['amd', 'cjs', 'es6', 'tsd'],
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    externalModuleResolutionStrategy: 'node_modules',
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/([^/]+)',
      },
      archi: {
        collapsePattern: '^(packages|apps)/([^/]+)|node_modules/([^/]+)',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
