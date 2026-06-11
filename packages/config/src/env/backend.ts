import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// ─── Esquema Zod ────────────────────────────────

const envSchema = z.object({
  // Obligatorias
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),

  // Puertos (coerción a número con defaults)
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_PORT: z.coerce.number().int().positive().default(3000),
  ADMIN_PORT: z.coerce.number().int().positive().default(3001),
  BACKEND_WEB_PORT: z.coerce.number().int().positive().default(4000),
  BACKEND_AI_PORT: z.coerce.number().int().positive().default(4001),
  SPACEMAIL_PORT: z.coerce.number().int().positive().default(465),

  // URLs y cadenas con defaults
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
  BACKEND_AI_URL: z.string().url().default('http://localhost:4001'),
  INTERNAL_API_SECRET: z.string().default('dev-internal-secret'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Autenticación
  NEXTAUTH_SECRET: z.string().default('dev-nextauth-secret-change-me'),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),

  // AI
  DEEPSEEK_API_KEY: z.string().default(''),
  DEEPSEEK_MODEL: z.string().default('deepseek-v4-flash'),

  // Observabilidad
  LANGFUSE_PUBLIC_KEY: z.string().default(''),
  LANGFUSE_SECRET_KEY: z.string().default(''),
  LANGFUSE_BASE_URL: z.string().url().default('https://cloud.langfuse.com'),

  // Email
  SPACEMAIL_HOST: z.string().default('mail.spacemail.com'),
  SPACEMAIL_USER: z.string().default(''),
  SPACEMAIL_PASS: z.string().default(''),

  // R2
  R2_ACCOUNT_ID: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default('agentrepo-assets'),
  R2_PUBLIC_URL: z.string().url().default('https://assets.agentrepo.dev'),

  // GitHub
  GITHUB_TOKEN: z.string().default(''),

  // Pesos de generación (coerción a número)
  TEMPLATE_DISTANCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.60),
  KEYWORD_MIN_SIMILARITY: z.coerce.number().min(0).max(1).default(0.35),
  KEYWORD_POSITIVE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.25),
  KEYWORD_NEGATIVE_WEIGHT: z.coerce.number().min(0).default(1.2),
});

// ─── Tipo inferido ──────────────────────────────

export type BackendEnvironment = z.infer<typeof envSchema>;

// ─── Singleton ──────────────────────────────────

export class BackendEnvironments {
  private static instance: BackendEnvironment;

  static load(): void {
    if (BackendEnvironments.instance) return;

    // Cargar .env desde la raíz del proyecto (compatible CJS/ESM)
    const envPath = path.resolve(process.cwd(), '.env');
    const result = dotenv.config({ path: envPath, override: true });

    if (result.error) {
      console.warn(
        `No se pudo cargar el archivo .env desde ${envPath}: ${result.error.message}`
      );
    }

    // Validar y transformar
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error('❌ Error de validación de entorno:', parsed.error.format());
      throw new Error('Variables de entorno inválidas. Revisa tu archivo .env');
    }

    BackendEnvironments.instance = parsed.data;
  }

  static get env(): BackendEnvironment {
    if (!BackendEnvironments.instance) {
      throw new Error(
        'BackendEnvironments no inicializado. Llama a BackendEnvironments.load() primero'
      );
    }
    return BackendEnvironments.instance;
  }

  // ─── Accesos directos (getters) ────────────────

  static get DATABASE_URL() { return BackendEnvironments.env.DATABASE_URL; }
  static get PORT() { return BackendEnvironments.env.PORT; }
  static get WEB_PORT() { return BackendEnvironments.env.WEB_PORT; }
  static get ADMIN_PORT() { return BackendEnvironments.env.ADMIN_PORT; }
  static get BACKEND_WEB_PORT() { return BackendEnvironments.env.BACKEND_WEB_PORT; }
  static get BACKEND_AI_PORT() { return BackendEnvironments.env.BACKEND_AI_PORT; }
  static get NEXT_PUBLIC_API_URL() { return BackendEnvironments.env.NEXT_PUBLIC_API_URL; }
  static get BACKEND_AI_URL() { return BackendEnvironments.env.BACKEND_AI_URL; }
  static get INTERNAL_API_SECRET() { return BackendEnvironments.env.INTERNAL_API_SECRET; }
  static get HOST() { return BackendEnvironments.env.HOST; }
  static get NODE_ENV() { return BackendEnvironments.env.NODE_ENV; }
  static get NEXTAUTH_SECRET() { return BackendEnvironments.env.NEXTAUTH_SECRET; }
  static get NEXTAUTH_URL() { return BackendEnvironments.env.NEXTAUTH_URL; }
  static get DEEPSEEK_API_KEY() { return BackendEnvironments.env.DEEPSEEK_API_KEY; }
  static get DEEPSEEK_MODEL() { return BackendEnvironments.env.DEEPSEEK_MODEL; }
  static get LANGFUSE_PUBLIC_KEY() { return BackendEnvironments.env.LANGFUSE_PUBLIC_KEY; }
  static get LANGFUSE_SECRET_KEY() { return BackendEnvironments.env.LANGFUSE_SECRET_KEY; }
  static get LANGFUSE_BASE_URL() { return BackendEnvironments.env.LANGFUSE_BASE_URL; }
  static get SPACEMAIL_HOST() { return BackendEnvironments.env.SPACEMAIL_HOST; }
  static get SPACEMAIL_PORT() { return BackendEnvironments.env.SPACEMAIL_PORT; }
  static get SPACEMAIL_USER() { return BackendEnvironments.env.SPACEMAIL_USER; }
  static get SPACEMAIL_PASS() { return BackendEnvironments.env.SPACEMAIL_PASS; }
  static get R2_ACCOUNT_ID() { return BackendEnvironments.env.R2_ACCOUNT_ID; }
  static get R2_ACCESS_KEY_ID() { return BackendEnvironments.env.R2_ACCESS_KEY_ID; }
  static get R2_SECRET_ACCESS_KEY() { return BackendEnvironments.env.R2_SECRET_ACCESS_KEY; }
  static get R2_BUCKET_NAME() { return BackendEnvironments.env.R2_BUCKET_NAME; }
  static get R2_PUBLIC_URL() { return BackendEnvironments.env.R2_PUBLIC_URL; }
  static get GITHUB_TOKEN() { return BackendEnvironments.env.GITHUB_TOKEN; }
  static get TEMPLATE_DISTANCE_THRESHOLD() { return BackendEnvironments.env.TEMPLATE_DISTANCE_THRESHOLD; }
  static get KEYWORD_MIN_SIMILARITY() { return BackendEnvironments.env.KEYWORD_MIN_SIMILARITY; }
  static get KEYWORD_POSITIVE_THRESHOLD() { return BackendEnvironments.env.KEYWORD_POSITIVE_THRESHOLD; }
  static get KEYWORD_NEGATIVE_WEIGHT() { return BackendEnvironments.env.KEYWORD_NEGATIVE_WEIGHT; }
}

// Carga automática al importar el módulo
BackendEnvironments.load();