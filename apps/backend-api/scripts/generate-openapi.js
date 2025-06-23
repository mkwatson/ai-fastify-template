#!/usr/bin/env node
/* eslint-disable no-undef */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { build } from '../test/helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateOpenAPISpec() {
  try {
    // Build the Fastify app
    const app = await build({
      logger: false, // Disable logging for spec generation
    });

    // Wait for plugins to load
    await app.ready();

    // Generate OpenAPI specification
    const spec = app.swagger();

    // Write to openapi.json file
    const outputPath = join(__dirname, '..', 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf8');

    console.log(`✅ OpenAPI specification generated at: ${outputPath}`);
    console.log(`📊 Found ${Object.keys(spec.paths || {}).length} endpoints`);

    // Close the app
    await app.close();

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI specification:', error);
    process.exit(1);
  }
}

// Run the generation
generateOpenAPISpec();
