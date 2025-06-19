# 🚀 ai-fastify-template – AI-Optimized Backend Template

## Project Background & Vision

This template creates a production-ready Fastify + TypeScript monorepo specifically designed for **AI-assisted development**. The goal is to provide the smallest possible foundation that includes comprehensive guardrails, enabling AI coding agents to work effectively without introducing technical debt or architectural violations.

### Why This Template Exists

Modern AI coding assistants (Cursor, GitHub Copilot, Claude, etc.) are powerful but can introduce subtle bugs, architectural violations, or security issues. This template provides:

- **Immediate feedback loops** for AI agents through fail-fast pipelines
- **Constraint-driven development** that guides AI toward correct patterns
- **Comprehensive quality gates** that catch issues before they reach production
- **Clear architectural boundaries** that prevent spaghetti code

### Primary Use Case

Built for **LLM-powered applications** that require secure backend infrastructure. Perfect for developers who want to build AI apps (chatbots, content generation, etc.) without exposing API keys in client code or managing complex backend concerns like authentication, rate limiting, and usage tracking.

## Tool Selection Rationale

_Produce the smallest Fastify + TypeScript monorepo that maximizes AI agent success:_

| Requirement                 | Tool(s)                     | Why This Choice                                   |
| --------------------------- | --------------------------- | ------------------------------------------------- |
| **Fast streaming API**      | Fastify · fastify-sse       | Essential for real-time AI responses              |
| **Linting + Formatting**    | ESLint + Prettier           | Industry standard with custom architectural rules |
| **Early type safety**       | TypeScript (`strict`)       | Catches AI-generated type errors immediately      |
| **Schema validation**       | Zod (bodies & env)          | Runtime validation prevents silent failures       |
| **Guard against spaghetti** | dependency-cruiser          | Enforces clean architecture boundaries            |
| **High-trust tests**        | Vitest + Stryker            | Mutation testing catches subtle AI logic errors   |
| **Generated SDK & docs**    | Fern                        | Auto-sync client/server contracts                 |
| **Task caching**            | pnpm workspaces + TurboRepo | Fast feedback for AI iteration cycles             |
| **Automated updates**       | Renovate                    | Keeps dependencies current without manual work    |
| **CI→CD**                   | GitHub Actions → Vercel     | Simple, reliable deployment pipeline              |

Everything downstream (logging, deploy) fits these choices with zero overlap.

## Development Workflow

Each step below follows this **AI coding agent workflow** using Linear API, GitHub API, and terminal commands for fully automated execution:

### **Per-Ticket Process (AI Agent)**

1. **Get Ticket & Create Branch**

   ```bash
   # AI agent gets ticket details via Linear API
   # mcp_Linear_get_issue(id="ticket-id")
   # mcp_Linear_get_issue_git_branch_name(id="ticket-id")

   # CRITICAL: Always start from latest main
   git checkout main
   git pull origin main

   # Create and push branch from updated main
   git checkout -b mar-10-bootstrap-monorepo
   git push -u origin mar-10-bootstrap-monorepo

   # Update Linear status via API
   # mcp_Linear_update_issue(id="ticket-id", stateId="in-progress-state-id")
   ```

2. **Execute Work & Commit with Magic Words**

   ```bash
   # AI agent executes the technical steps
   # Uses run_terminal_cmd() for all commands
   # Uses edit_file() for code changes

   # Atomic commits with Linear references
   git add .
   git commit -m "feat: initialize pnpm workspace (refs MAR-10)"

   git add turbo.json
   git commit -m "feat: add TurboRepo pipeline (refs MAR-10)"

   # Final commit auto-closes ticket on merge
   git commit -m "feat: complete monorepo bootstrap (fixes MAR-10)

   All acceptance criteria verified:
   - ✅ pnpm workspace configured
   - ✅ TurboRepo pipeline added
   - ✅ Verification commands pass"
   ```

3. **Create PR via GitHub API**

   ```bash
   # AI agent creates PR programmatically
   # mcp_GitHub_create_pull_request(
   #   title="[MAR-10] Bootstrap Monorepo",
   #   body="Fixes MAR-10\n\n[detailed description]",
   #   head="mar-10-bootstrap-monorepo",
   #   base="main"
   # )
   ```

4. **Verify & Merge**
   ```bash
   # AI agent can check PR status
   # mcp_GitHub_get_pull_request_status()
   #
   # Human reviews and merges (or auto-merge if CI passes)
   # Linear automatically moves ticket to "Done" on merge
   ```

### **AI Agent Capabilities**

- **Direct API access** to Linear (get tickets, update status, add comments)
- **GitHub automation** (create branches, PRs, check status)
- **Terminal execution** (run all build/test commands)
- **File manipulation** (create, edit, delete files)
- **Verification** (test commands, check acceptance criteria)

### **Quality Gates (Automated)**

- AI agent verifies each acceptance criterion before proceeding
- Continuous testing via `run_terminal_cmd()`
- Atomic commits with descriptive messages
- Automated status updates via Linear API
- Zero human intervention required for routine tasks

### **Human Oversight Points**

- **Code review** of AI-generated PRs
- **Merge approval** (can be automated with proper CI)
- **Strategic decisions** (scope changes, architecture choices)

This workflow enables AI agents to execute entire tickets autonomously while maintaining professional standards and full traceability.

## 1. Bootstrap Monorepo

```bash
mkdir ai-fastify-template && cd $_
git init
pnpm init -y
echo 'packages: ["apps/*","packages/*"]' > pnpm-workspace.yaml
pnpm dlx create-turbo .
```

Verify

```
cat turbo.json   # should show a minimal pipeline
pnpm -v          # workspace aware
```

Commit

```
git add .
git commit -m "chore: scaffold pnpm workspace + TurboRepo"
```

⸻

## 2. Add Backend API Skeleton

Create the core Fastify application with strict TypeScript configuration:

```bash
mkdir -p apps/backend-api && cd apps/backend-api
pnpm dlx create-fastify . --lang=ts --integrations=pino
```

Configure strict TypeScript mode in `apps/backend-api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "build",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "test"]
}
```

Update `apps/backend-api/package.json` scripts:

```json
{
  "scripts": {
    "dev": "fastify start -l info src/app.ts -w",
    "build": "tsc",
    "start": "node build/app.js",
    "test": "vitest"
  }
}
```

Test the setup:

```bash
cd apps/backend-api
pnpm dev
# In another terminal:
curl http://localhost:3000/
```

Expected response: `{"message":"Hello World!"}`

Commit:

```bash
git add .
git commit -m "feat(api): initial Fastify TS server (strict mode, Pino logs)"
```

## 3. Add ESLint + Prettier (format + lint)

**Note**: Originally planned to use Biome, but migrated to ESLint + Prettier for better architectural rule enforcement and ecosystem maturity.

Install ESLint and Prettier with TypeScript support:

```bash
pnpm add -Dw eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-security
```

ESLint configuration is in `.eslintrc.js` with custom architectural rules and Prettier configuration is in `.prettierrc`.

Add scripts to root `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . && prettier --check .",
    "lint:fix": "eslint . --fix && prettier --write .",
    "format": "prettier --write ."
  }
}
```

Format existing code:

```bash
pnpm lint:fix
```

Commit:

```bash
git add .
git commit -m "chore: add Biome strict preset as sole formatter+lint"
```

## 4. AI-Specific Tooling & Guidelines

_This step comes early to establish AI agent guidelines before adding complex logic._

Create `.cursorrules` file in the root:

```
# AI Coding Assistant Rules for ai-fastify-template

## Architecture Principles
- Follow strict TypeScript - no `any` types
- Use Zod for all runtime validation (env, request bodies, responses)
- Keep routes thin - business logic goes in services
- Services should not import from routes or plugins
- Use dependency injection patterns for testability

## Code Patterns
- Prefer explicit error handling over throwing exceptions
- Use Fastify's built-in validation and serialization
- Always validate environment variables with Zod schemas
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
- Implement proper logging with structured data

## Testing Requirements
- Write unit tests for all business logic
- Write integration tests for all routes
- Aim for >90% mutation test coverage
- Mock external dependencies in tests

## Common Pitfalls to Avoid
- Don't use `fastify.register()` without proper encapsulation
- Don't access `process.env` directly - use validated env schema
- Don't mix async/await with callbacks
- Don't forget to handle stream cleanup in SSE endpoints
- Don't skip input validation on any public endpoint

## File Organization
- Routes: `src/routes/` - HTTP handlers only
- Services: `src/services/` - Business logic
- Plugins: `src/plugins/` - Fastify plugins
- Types: `src/types/` - Shared TypeScript types
- Utils: `src/utils/` - Pure utility functions
```

Create `docs/ai-guidelines.md`:

```markdown
# AI Development Guidelines

## Why These Constraints Exist

This template uses strict constraints to guide AI agents toward maintainable, secure code:

### TypeScript Strict Mode

- Catches type errors before runtime
- Prevents `undefined` and `null` related bugs
- Makes refactoring safer for AI agents

### Zod Validation

- Runtime validation prevents silent failures
- Clear error messages for debugging
- Type inference reduces boilerplate

### Dependency Cruiser

- Prevents circular dependencies
- Enforces layered architecture
- Catches import violations early

### Mutation Testing

- Ensures tests actually validate logic
- Catches subtle bugs AI agents often miss
- Higher confidence in generated code

## Working with AI Agents

### Effective Prompts
```

"Add a new route that validates the request body with Zod and follows the existing error handling patterns"

```

### Less Effective Prompts
```

"Add a route" (too vague, likely to skip validation)

```

### When AI Gets Stuck
1. Check the pipeline output: `pnpm ci`
2. Look for specific error messages
3. Reference existing patterns in the codebase
4. Ask AI to fix one constraint at a time
```

Add AI tooling scripts to root `package.json`:

```json
{
  "scripts": {
    "ai:check": "echo 'Running AI-friendly checks...' && pnpm lint && pnpm type && pnpm graph",
    "ai:fix": "pnpm lint:fix && echo 'Manual fixes may be needed for type/graph errors'"
  }
}
```

Test the AI guidelines:

```bash
pnpm ai:check
```

Commit:

```bash
git add .cursorrules docs/ai-guidelines.md package.json
git commit -m "feat: add AI agent guidelines and cursor rules"
```

## 5. Zod Validation (+ replace fastify-env)

Replace Fastify's built-in env handling with Zod for better type safety and validation:

```bash
cd apps/backend-api
pnpm add zod
pnpm remove @fastify/env
```

Create `src/plugins/env.ts`:

```typescript
import fp from 'fastify-plugin';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  HOST: z.string().default('localhost'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}

export default fp(
  async fastify => {
    try {
      const config = EnvSchema.parse(process.env);
      fastify.decorate('config', config);
      fastify.log.info({ config }, 'Environment configuration loaded');
    } catch (error) {
      fastify.log.error({ error }, 'Invalid environment configuration');
      throw error;
    }
  },
  {
    name: 'env-plugin',
  }
);
```

Update `src/app.ts` to use the new env plugin:

```typescript
import { join } from 'path';
import AutoLoad from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import envPlugin from './plugins/env';

export type AppOptions = {
  // Place your custom options for app below here.
};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Register env plugin first
  await fastify.register(envPlugin);

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });
};

export default app;
export { app };
```

Test the configuration:

```bash
cd apps/backend-api
pnpm dev
# Should start without errors and log the configuration
```

Commit:

```bash
git add apps/backend-api
git commit -m "feat(api): Zod-driven env validation plugin (replaces fastify-env)"
```

## 6. SSE Streaming Route

Add Server-Sent Events capability for real-time AI responses:

```bash
cd apps/backend-api
pnpm add @fastify/sse
```

Create `src/routes/stream/index.ts`:

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const StreamQuerySchema = z.object({
  count: z.string().regex(/^\d+$/).transform(Number).default('5'),
  interval: z.string().regex(/^\d+$/).transform(Number).default('1000'),
});

const stream: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(require('@fastify/sse'));

  fastify.get(
    '/demo',
    {
      schema: {
        querystring: StreamQuerySchema,
        response: {
          200: {
            type: 'string',
            description: 'Server-sent events stream',
          },
        },
      },
    },
    async (request, reply) => {
      const { count, interval } = StreamQuerySchema.parse(request.query);

      reply.sse({
        id: '0',
        data: JSON.stringify({
          message: 'Stream started',
          timestamp: Date.now(),
        }),
      });

      let currentCount = 0;
      const streamInterval = setInterval(() => {
        currentCount++;
        const data = {
          message: `Tick ${currentCount}`,
          timestamp: Date.now(),
          progress: currentCount / count,
        };

        reply.sse({
          id: currentCount.toString(),
          data: JSON.stringify(data),
        });

        if (currentCount >= count) {
          clearInterval(streamInterval);
          reply.sse({
            id: 'end',
            data: JSON.stringify({
              message: 'Stream completed',
              timestamp: Date.now(),
            }),
          });
          reply.sseEnd();
        }
      }, interval);

      // Cleanup on client disconnect
      request.raw.on('close', () => {
        clearInterval(streamInterval);
      });
    }
  );
};

export default stream;
```

Test the streaming endpoint:

```bash
cd apps/backend-api
pnpm dev
# In another terminal:
curl -N "http://localhost:3000/stream/demo?count=3&interval=500"
```

Expected: JSON messages streaming every 500ms, 3 times total.

Commit:

```bash
git add apps/backend-api
git commit -m "feat(api): SSE streaming endpoint with Zod validation"
```

## 7. Vitest (unit + integration)

Set up comprehensive testing with both unit and integration test examples:

```bash
pnpm add -Dw vitest @vitest/coverage-v8 @types/node
```

Create `vitest.config.ts` in the root:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'build/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
    },
  },
});
```

Create `apps/backend-api/src/utils/example.ts`:

```typescript
export function calculateTotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

Create `apps/backend-api/test/utils/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotal, formatCurrency } from '../../src/utils/example';

describe('calculateTotal', () => {
  it('should calculate total for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should calculate total for single item', () => {
    expect(calculateTotal([{ price: 10, quantity: 2 }])).toBe(20);
  });

  it('should calculate total for multiple items', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(35);
  });
});

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format other currencies', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });
});
```

Create `apps/backend-api/test/routes/stream.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helper';
import { FastifyInstance } from 'fastify';

describe('Stream routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 for stream demo endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/stream/demo?count=1&interval=100',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
  });

  it('should validate query parameters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/stream/demo?count=invalid',
    });

    expect(response.statusCode).toBe(400);
  });
});
```

Create `apps/backend-api/test/helper.ts`:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import App from '../src/app';

export async function build(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Disable logging in tests
  });

  await app.register(fp(App));
  await app.ready();

  return app;
}
```

Add test scripts to `apps/backend-api/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Add test script to root `package.json`:

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage"
  }
}
```

Run tests:

```bash
pnpm test
```

Expected: All tests pass with coverage report.

Commit:

```bash
git add .
git commit -m "test: add Vitest unit & integration test suites with coverage"
```

## 8. Mutation Testing (Stryker)

```
pnpm add -Dw @stryker-mutator/core @stryker-mutator/vitest-runner
npx stryker init --test-runner vitest --mutate "apps/backend-api/src/**/*.ts"
```

Set thresholds 90/80/80.

```
pnpm mutation
```

Commit

```
git add .
git commit -m "chore: wire Stryker mutation testing (gate ≥90%)"
```

## 9. Import-Graph Guard (dependency-cruiser)

```
pnpm add -Dw dependency-cruiser
npx depcruise --init
```

Edit rules to forbid cycles & enforce routes→services→domain.

Add script:

```
"graph": "depcruise --validate ."
```

Run `pnpm graph`.

Commit

```
git add .dependency-cruiser.js package.json
git commit -m "chore: add dependency-cruiser import/layer rules"
```

## 10. Fern SDK & Docs Generation

```
pnpm dlx fern init
```

Point Fern config to `apps/backend-api/openapi.json` (from Fastify Swagger).

Add GH Action later; locally verify:

```
pnpm fern generate
ls packages/sdk      # generated code
```

Commit

```
git add fern packages/sdk
git commit -m "feat: integrate Fern to generate TS SDK + docs from OpenAPI"
```

11. Turbo Tasks + Root Scripts

Update turbo.json:

```
{
  "tasks": {
    "lint":   { "outputs": [] },
    "type":   { "outputs": [] },
    "graph":  { "outputs": [] },
    "test":   { "dependsOn": ["lint", "type", "graph"], "outputs": ["coverage/**"] },
    "mutation": { "dependsOn": ["test"], "outputs": [] },
    "build":  { "dependsOn": ["mutation"], "outputs": ["dist/**", "build/**"] }
  }
}
```

Root package.json "ci" script already calls these.

Commit

```
git add turbo.json package.json
git commit -m "chore: define fail-fast Turbo pipeline"
```

## 12. GitHub Actions CI + (optional) Vercel / npm Tokens

Create `.github/workflows/ci.yml` with steps: 1. Checkout 2. pnpm install 3. pnpm ci (runs lint→type→graph→test→mutation) 4. fern-action (only on main if NPM_TOKEN set) 5. Vercel deploy (only on main if VERCEL_TOKEN set)

Push a branch, open PR—CI should be green.

Commit

```
git add .github/workflows/ci.yml
git commit -m "ci: single Action running fail-fast pipeline + optional publish/deploy"
```

## 13. Renovate

Add `renovate.json` (or enable Renovate app).
Test by running `renovate-config-validator`.

Commit

```
git add renovate.json
git commit -m "chore: enable Renovate for dependency PRs"
```

## 14. Docs, License, Template Metadata

    •	README.md (the story + quick start)
    •	LICENSE (MIT)
    •	.github/ISSUE_TEMPLATE.md optional

Commit

```
git add README.md LICENSE
git commit -m "docs: initial README and MIT license"
```

## ✔️ Finished

Clone fresh, pnpm install, pnpm ci → everything passes without extra config.
Add secrets only when you want auto-publishing to npm or deploying to Vercel.

You now have a zero-conf, AI-guard-railed streaming API template ready for real features—or for the next experiment in agent-driven development.
