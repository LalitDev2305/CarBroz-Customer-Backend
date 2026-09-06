import * as dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

export class RuntimeConfigError extends Error {
  constructor(readonly issues: unknown) {
    super('Invalid runtime configuration');
    this.name = 'RuntimeConfigError';
  }
}

export const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
});

export const databaseSchema = z.object({
  DATABASE_URL: z.string().url().refine(
    (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
    'DATABASE_URL must use PostgreSQL',
  ),
});

export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  JWT_ISSUER: z.string().default('carbroz.com'),
  JWT_AUDIENCE: z.string().default('carbroz-users'),
  AUTH_TOKEN_PEPPER: z.string().min(32).optional(),
});

export const redisSchema = z.object({
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
});

export const loggingSchema = z.object({
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export const securitySchema = z.object({
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  OTP_PROVIDER_MODE: z.enum(['provider', 'mock']).default('mock'),
  OTP_TTL_SECONDS: z.coerce.number().int().min(60).max(900).default(300),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(15).max(300).default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),
  OTP_MAX_REQUESTS_PER_HOUR: z.coerce.number().int().min(1).max(20).default(5),
});

export const providersSchema = z.object({
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
});

export const rootSchema = appSchema
  .merge(databaseSchema)
  .merge(jwtSchema)
  .merge(redisSchema)
  .merge(loggingSchema)
  .merge(securitySchema)
  .merge(providersSchema)
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== 'production') return;

    if (value.JWT_SECRET.length < 32) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_SECRET'], message: 'Production JWT_SECRET must be at least 32 characters' });
    }
    if (!value.AUTH_TOKEN_PEPPER || value.AUTH_TOKEN_PEPPER.length < 32) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['AUTH_TOKEN_PEPPER'], message: 'AUTH_TOKEN_PEPPER is required in production and must be at least 32 characters' });
    }
    if (value.CORS_ORIGIN === '*') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['CORS_ORIGIN'], message: 'Wildcard CORS is forbidden in production' });
    }
    if (value.OTP_PROVIDER_MODE !== 'provider') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['OTP_PROVIDER_MODE'], message: 'Mock OTP mode is forbidden in production' });
    }
    if (!value.MINIO_ACCESS_KEY || !value.MINIO_SECRET_KEY) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['MINIO_ACCESS_KEY'], message: 'Object-storage credentials are required in production' });
    }
  });

export type RuntimeEnv = z.infer<typeof rootSchema>;

export function parseRuntimeConfig(source: NodeJS.ProcessEnv | Record<string, string | undefined>): RuntimeEnv {
  const parsed = rootSchema.safeParse(source);
  if (!parsed.success) {
    throw new RuntimeConfigError(parsed.error.flatten());
  }
  return parsed.data;
}

let envPath = path.resolve(process.cwd(), '../../.env');
if (!fs.existsSync(envPath)) envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export const env = parseRuntimeConfig(process.env);

export const AppConfig = { env: env.NODE_ENV, port: env.PORT, host: env.HOST };
export const DatabaseConfig = { url: env.DATABASE_URL };
export const JwtConfig = {
  secret: env.JWT_SECRET,
  accessExpiration: env.JWT_ACCESS_EXPIRATION,
  refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
};
export const AuthSecurityConfig = {
  tokenPepper: env.AUTH_TOKEN_PEPPER ?? env.JWT_SECRET,
  otpProviderMode: env.OTP_PROVIDER_MODE,
  otpTtlSeconds: env.OTP_TTL_SECONDS,
  otpResendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
  otpMaxAttempts: env.OTP_MAX_ATTEMPTS,
  otpMaxRequestsPerHour: env.OTP_MAX_REQUESTS_PER_HOUR,
};
export const RedisConfig = { url: env.REDIS_URL };
export const LoggingConfig = { logLevel: env.LOG_LEVEL };
export const SecurityConfig = {
  corsOrigin: env.CORS_ORIGIN,
  rateLimitMax: env.RATE_LIMIT_MAX,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
};
export const ProvidersConfig = {
  minioEndpoint: env.MINIO_ENDPOINT,
  minioPort: env.MINIO_PORT,
  minioUseSSL: env.MINIO_USE_SSL,
  minioAccessKey: env.MINIO_ACCESS_KEY,
  minioSecretKey: env.MINIO_SECRET_KEY,
};
