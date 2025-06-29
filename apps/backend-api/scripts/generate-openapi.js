#!/usr/bin/env node

/**
 * This script is for development use and requires the TypeScript source.
 * For production use, run `pnpm openapi:generate` which builds first.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateOpenAPISpec() {
  try {
    // Since we're importing TypeScript files, we need to use tsx
    const scriptPath = join(__dirname, 'generate-openapi-temp.ts');

    // Create a TypeScript version that can import the helper
    const tsScript = `
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { build } from '../test/helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generate() {
  const app = await build({ logger: false });
  await app.ready();
  const spec = app.swagger();
  const outputPath = join(__dirname, '..', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf8');
  console.log(\`✅ OpenAPI specification generated at: \${outputPath}\`);
  console.log(\`📊 Found \${Object.keys(spec.paths || {}).length} endpoints\`);
  await app.close();
}

generate().catch(error => {
  console.error('❌ Failed to generate OpenAPI specification:', error);
  process.exit(1);
});
`;

    // Write temporary TypeScript file
    writeFileSync(scriptPath, tsScript, 'utf8');

    try {
      // Run with tsx
      execSync(`npx tsx ${scriptPath}`, {
        stdio: 'inherit',
        cwd: join(__dirname, '..'),
      });
    } finally {
      // Clean up temporary file
      if (existsSync(scriptPath)) {
        unlinkSync(scriptPath);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI specification:', error);
    process.exit(1);
  }
}

// Run the generation
generateOpenAPISpec();
