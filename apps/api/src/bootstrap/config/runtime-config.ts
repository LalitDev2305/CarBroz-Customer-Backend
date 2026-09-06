import * as dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

export class RuntimeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeConfigError';
  }
}

export const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
});

export const databaseSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  JWT_ISSUER: z.string().min(1).default('carbroz.com'),
  JWT_AUDIENCE: z.string().min(1).default('carbroz-users'),
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
});

export const providersSchema = z.object({
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().int().positive().max(65535).default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MSG91_AUTH_KEY: z.string().min(1).optional(),
  MSG91_OTP_TEMPLATE_ID: z.string().min(1).optional(),
  MSG91_OTP_VARIABLE_NAME: z.string().min(1).optional(),
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

    if (value.CORS_ORIGIN.trim() === '*') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'Production CORS_ORIGIN must be explicit',
      });
    }
    if (/localhost|127\.0\.0\.1/i.test(value.REDIS_URL)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_URL'],
        message: 'Production REDIS_URL must not use localhost',
      });
    }
    if (/localhost|127\.0\.0\.1/i.test(value.MINIO_ENDPOINT)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MINIO_ENDPOINT'],
        message: 'Production MINIO_ENDPOINT must not use localhost',
      });
    }
    if (!value.MINIO_ACCESS_KEY || !value.MINIO_SECRET_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MINIO_ACCESS_KEY'],
        message: 'Production object storage credentials are required',
      });
    }
    if (!value.MINIO_USE_SSL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MINIO_USE_SSL'],
        message: 'Production object storage must use TLS',
      });
    }
    if (!value.MSG91_AUTH_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MSG91_AUTH_KEY'],
        message: 'Production SMS provider credentials are required',
      });
    }
    if (!value.MSG91_OTP_TEMPLATE_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MSG91_OTP_TEMPLATE_ID'],
        message: 'Production OTP template configuration is required',
      });
    }
    if (!value.MSG91_OTP_VARIABLE_NAME) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MSG91_OTP_VARIABLE_NAME'],
        message: 'Production OTP template variable configuration is required',
      });
    }
  });

let envPath = path.resolve(process.cwd(), '../../.env');
if (!fs.existsSync(envPath)) envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const parsedEnv = rootSchema.safeParse(process.env);
if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('; ');
  throw new RuntimeConfigError(`Invalid runtime configuration: ${issues}`);
}

export const env = parsedEnv.data;

export const AppConfig = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
};

export const DatabaseConfig = { url: env.DATABASE_URL };

export const JwtConfig = {
  secret: env.JWT_SECRET,
  accessExpiration: env.JWT_ACCESS_EXPIRATION,
  refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
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
  msg91AuthKey: env.MSG91_AUTH_KEY,
  msg91OtpTemplateId: env.MSG91_OTP_TEMPLATE_ID,
  msg91OtpVariableName: env.MSG91_OTP_VARIABLE_NAME,
};
