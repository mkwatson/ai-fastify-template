#!/usr/bin/env node

/**
 * AI Guidelines Compliance Validator
 * Version: 2.0.0
 *
 * Validates project-specific business rules for AI development guidelines.
 * Generic rules (no-any, formatting) are handled by Biome and ESLint.
 */

const fs = require("node:fs");
const path = require("node:path");

class AIComplianceValidator {
  constructor() {
    this.violations = [];
    this.checks = 0;
    this.passed = 0;
  }

  log(message, type = "info") {
    const prefix = {
      info: "📋",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    }[type];
    console.log(`${prefix} ${message}`);
  }

  addViolation(file, line, rule, message) {
    this.violations.push({ file, line, rule, message });
  }

  checkFile(filePath, content) {
    this.checks++;

    // Check 1: Direct process.env access (should use validated env schema)
    const processEnvMatches = content.match(/process\.env\./g);
    if (processEnvMatches && 
        !filePath.includes("env.ts") && 
        !filePath.includes("validate-env") &&
        !filePath.includes("test/")) {
      this.addViolation(
        filePath,
        null,
        "NO_DIRECT_ENV_ACCESS",
        "Direct process.env access found - use validated env schema instead",
      );
    }

    // Check 2: Proper error handling patterns in routes
    if (filePath.includes("/routes/") && content.includes("throw new Error(")) {
      this.addViolation(
        filePath,
        null,
        "IMPROPER_ERROR_HANDLING",
        "Generic Error throwing in routes - use Fastify error handling patterns (fastify.httpErrors)",
      );
    }

    // Check 3: Missing input validation in routes
    if (
      filePath.includes("/routes/") &&
      content.includes("request.body") &&
      !content.includes("schema:") &&
      !content.includes("Schema")
    ) {
      this.addViolation(
        filePath,
        null,
        "MISSING_INPUT_VALIDATION",
        "Route uses request.body without Zod schema validation",
      );
    }

    // Check 4: Service layer dependency injection patterns
    if (
      filePath.includes("/services/") &&
      content.includes("new ") &&
      content.includes("class ") &&
      !content.includes("constructor(")
    ) {
      this.addViolation(
        filePath,
        null,
        "MISSING_DEPENDENCY_INJECTION",
        "Service class should use dependency injection via constructor",
      );
    }

    // Check 5: Plugin registration patterns
    if (
      filePath.includes("/plugins/") &&
      content.includes("export default") &&
      !content.includes("fastify-plugin")
    ) {
      this.addViolation(
        filePath,
        null,
        "IMPROPER_PLUGIN_REGISTRATION",
        "Fastify plugins should use fastify-plugin wrapper",
      );
    }

    if (this.violations.length === 0) {
      this.passed++;
    }
  }

  async validateDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, build directories
        if (
          !["node_modules", ".git", "build", "dist", ".turbo"].includes(
            entry.name,
          )
        ) {
          await this.validateDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        // Check TypeScript and JavaScript files
        if (/\.(ts|js)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            this.checkFile(fullPath, content);
          } catch (error) {
            this.log(`Error reading ${fullPath}: ${error.message}`, "warning");
          }
        }
      }
    }
  }

  generateReport() {
    this.log("\n🔍 AI Guidelines Compliance Report", "info");
    this.log(`Files checked: ${this.checks}`, "info");
    this.log(`Files passed: ${this.passed}`, "success");
    this.log(
      `Violations found: ${this.violations.length}`,
      this.violations.length > 0 ? "error" : "success",
    );

    if (this.violations.length > 0) {
      this.log("\n📋 Violations by Category:", "info");

      const violationsByRule = {};
      for (const v of this.violations) {
        if (!violationsByRule[v.rule]) violationsByRule[v.rule] = [];
        violationsByRule[v.rule].push(v);
      }

      for (const [rule, violations] of Object.entries(violationsByRule)) {
        this.log(`\n❌ ${rule} (${violations.length} violations):`, "error");
        for (const v of violations) {
          this.log(`   ${v.file}: ${v.message}`, "error");
        }
      }

      this.log("\n💡 Remediation Guide:", "info");
      this.log("• Run `pnpm lint:fix` to auto-fix formatting issues", "info");
      this.log("• Run `pnpm lint:eslint` to check additional rules", "info");
      this.log("• Review AI guidelines: AGENTS.md", "info");
      this.log("• Check project patterns in existing code", "info");
    }

    return this.violations.length === 0;
  }
}

async function main() {
  const validator = new AIComplianceValidator();

  validator.log("🚀 Starting AI Guidelines Compliance Check...", "info");

  try {
    // Validate apps directory (main source code)
    if (fs.existsSync("apps")) {
      await validator.validateDirectory("apps");
    }

    // Validate packages directory if it exists
    if (fs.existsSync("packages")) {
      await validator.validateDirectory("packages");
    }

    const success = validator.generateReport();

    if (success) {
      validator.log(
        "\n🎉 All AI guideline compliance checks passed!",
        "success",
      );
      process.exit(0);
    } else {
      validator.log(
        "\n🔧 Please address the violations above to ensure AI guideline compliance.",
        "warning",
      );
      process.exit(1);
    }
  } catch (error) {
    validator.log(`Fatal error during validation: ${error.message}`, "error");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AIComplianceValidator };
