// This file contains code that we reuse between our tests.
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
const helper = require('fastify-cli/helper.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export type TestContext = {
  after: (fn: () => void | Promise<void>) => void
}

const AppPath = path.join(__dirname, '..', 'build', 'app.js')

// Fill in this config with all the configurations
// needed for testing the application
function config () {
  return {
    skipOverride: true // Register our application with fastify-plugin
  }
}

// Automatically build and tear down our instance
async function build (t: TestContext) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, config())

  // Tear down our app after we are done
  t.after(() => app.close())

  return app
}

export {
  config,
  build
}
