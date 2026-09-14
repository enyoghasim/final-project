import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  CORS_ORIGIN: z
    .string()
    .min(1, "CORS_ORIGIN is required")
    .transform((val) =>
      val
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
  DISABLE_SIGNUP: z
    .string()
    .default("true")
    .transform((val) => val.toLowerCase() !== "false"),

  // S3-compatible object storage (MinIO in dev and prod) for original resume files.
  S3_ENDPOINT: z.string().min(1, "S3_ENDPOINT is required"),
  // Only needed when the API reaches storage over a different address than a
  // browser would (e.g. an internal Docker hostname vs. a public MinIO URL) —
  // presigned download links are signed against this one so browsers can follow them.
  S3_PUBLIC_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required"),
  S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required"),
  S3_BUCKET: z.string().default("resume-ai"),
  S3_FORCE_PATH_STYLE: z
    .string()
    .default("true")
    .transform((val) => val.toLowerCase() !== "false"),

  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // Public origin of the web app, used to build absolute share/OG links.
  // Falls back to the first CORS_ORIGIN entry when unset.
  WEB_PUBLIC_URL: z.string().url().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    // eslint-disable-next-line no-console
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
