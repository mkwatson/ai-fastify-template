import fp from "fastify-plugin";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"], {
      errorMap: () => ({
        message: "NODE_ENV must be one of: development, production, test",
      }),
    })
    .default("development"),

  PORT: z
    .string({
      required_error: "PORT environment variable is required",
      invalid_type_error: "PORT must be a string",
    })
    .regex(/^\d+$/, "PORT must contain only numeric characters")
    .transform(Number)
    .refine((n) => n > 0 && n < 65536, "PORT must be between 1-65535")
    .default("3000"),

  HOST: z
    .string({
      invalid_type_error: "HOST must be a string",
    })
    .min(1, "HOST cannot be empty")
    .default("localhost"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"], {
      errorMap: () => ({
        message:
          "LOG_LEVEL must be one of: fatal, error, warn, info, debug, trace",
      }),
    })
    .default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

// List of sensitive environment variable patterns to redact from logs
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /auth/i,
  /credential/i,
  /database_url/i,
  /connection_string/i,
];

function createSafeConfig(config: Env): Record<string, unknown> {
  const safeConfig: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    const isSensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
    safeConfig[key] = isSensitive ? "[REDACTED]" : value;
  }

  return safeConfig;
}

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
  }
}

export default fp(
  async (fastify) => {
    try {
      const config = EnvSchema.parse(process.env);
      fastify.decorate("config", config);

      // Log safe config (sensitive fields redacted)
      const safeConfig = createSafeConfig(config);
      fastify.log.info(
        { config: safeConfig },
        "Environment configuration loaded",
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
          received: "received" in err ? err.received : undefined,
        }));

        fastify.log.error(
          {
            validationErrors: formattedErrors,
          },
          "Environment validation failed",
        );

        throw new Error(
          `Environment validation failed: ${formattedErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`,
        );
      }

      fastify.log.error({ error }, "Invalid environment configuration");
      throw error;
    }
  },
  {
    name: "env-plugin",
  },
);
