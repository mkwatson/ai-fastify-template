#!/usr/bin/env node
/* eslint-disable no-undef */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, existsSync } from 'node:fs';
import Fastify from 'fastify';
import fp from 'fastify-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateOpenAPISpec() {
  try {
    // Check if build directory exists
    const buildPath = join(__dirname, '..', 'build');
    if (!existsSync(buildPath)) {
      console.error(
        '❌ Build directory not found. Please run "pnpm build" first.'
      );
      process.exit(1);
    }

    // Import the built app
    const { default: App } = await import('../build/app.js');

    // Build the Fastify app
    const app = Fastify({
      logger: false, // Disable logging for spec generation
    });

    // Register our application
    await app.register(fp(App));

    // Wait for plugins to load (this might take a moment for autoload)
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
