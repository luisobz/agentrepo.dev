import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const backendEnv = createEnv({
  server: {
    WEB_PORT: z.coerce.number().default(3000),
    ADMIN_PORT: z.coerce.number().default(3001),
    BACKEND_WEB_PORT: z.coerce.number().default(4000),
    BACKEND_AI_PORT: z.coerce.number().default(4001),
    BACKEND_AI_URL: z.string().url().optional(),
    INTERNAL_API_SECRET: z.string().min(1),

    DATABASE_URL: z.string().url(),

    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),

    DEEPSEEK_API_KEY: z.string().optional(),
    DEEPSEEK_MODEL: z.string().default("deepseek-v4-flash"),

    LANGFUSE_PUBLIC_KEY: z.string().optional(),
    LANGFUSE_SECRET_KEY: z.string().optional(),
    LANGFUSE_BASE_URL: z.string().url().optional(),

    SPACEMAIL_HOST: z.string().optional(),
    SPACEMAIL_PORT: z.coerce.number().default(465),
    SPACEMAIL_USER: z.string().optional(),
    SPACEMAIL_PASS: z.string().optional(),

    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PUBLIC_URL: z.string().url().optional(),

    GITHUB_TOKEN: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
