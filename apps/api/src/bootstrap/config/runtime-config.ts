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

const booleanFromEnv = z.preprocess((input) => {
  if (typeof input !== 'string') return input;
  const normalized = input.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return input;
}, z.boolean());

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase().replace(/^\[|\]$/g, '');
  return normalized === 'localhost'
    || normalized === '127.0.0.1'
    || normalized === '0.0.0.0'
    || normalized === '::1'
    || normalized.endsWith('.localhost');
}

function isKnownPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === 'mock'
    || normalized === 'minioadmin'
    || normalized === 'dummy'
    || normalized === 'dummy_secret'
    || normalized.startsWith('replace_with_')
    || normalized.startsWith('change-me')
    || normalized.startsWith('change_me');
}

export const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
});

export const databaseSchema = z.object({
  DATABASE_URL: z.string().url().refine(
    (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
    'DATABASE_URL must use PostgreSQL',
  ),
});

export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  JWT_ISSUER: z.string().min(1).default('carbroz.com'),
  JWT_AUDIENCE: z.string().min(1).default('carbroz-users'),
});

export const redisSchema = z.object({
  REDIS_URL: z.string().url().refine(
    (value) => value.startsWith('redis://') || value.startsWith('rediss://'),
    'REDIS_URL must use redis:// or rediss://',
  ).default('redis://localhost:6379'),
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
  MINIO_ENDPOINT: z.string().min(1).default('localhost'),
  MINIO_PORT: z.coerce.number().int().positive().max(65535).default(9000),
  MINIO_USE_SSL: booleanFromEnv.default(false),
  MINIO_ACCESS_KEY: z.string().min(1).optional(),
  MINIO_SECRET_KEY: z.string().min(1).optional(),
  MSG91_AUTH_KEY: z.string().min(1).optional(),
  MSG91_OTP_TEMPLATE_ID: z.string().min(1).optional(),
  MSG91_OTP_VARIABLE_NAME: z.string().min(1).optional(),
  MAPS_API_KEY: z.string().min(1).optional(),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
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

    const databaseUrl = new URL(value.DATABASE_URL);
    if (isLocalHostname(databaseUrl.hostname)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'Production DATABASE_URL must not use localhost',
      });
    }
    const databaseUser = databaseUrl.username.toLowerCase();
    const databasePassword = databaseUrl.password.toLowerCase();
    if (databaseUser === 'postgres' && databasePassword === 'postgres') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'Production DATABASE_URL must not use default PostgreSQL credentials',
      });
    }
    if (isKnownPlaceholder(value.JWT_SECRET)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'Production JWT_SECRET must not use a known placeholder/default value',
      });
    }
    if (value.CORS_ORIGIN.trim() === '*') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'Production CORS_ORIGIN must be explicit',
      });
    }

    const redisUrl = new URL(value.REDIS_URL);
    if (isLocalHostname(redisUrl.hostname)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_URL'],
        message: 'Production REDIS_URL must not use localhost',
      });
    }
    if (isLocalHostname(value.MINIO_ENDPOINT)) {
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
    } else if (isKnownPlaceholder(value.MINIO_ACCESS_KEY) || isKnownPlaceholder(value.MINIO_SECRET_KEY)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MINIO_ACCESS_KEY'],
        message: 'Production object storage credentials must not use known placeholder/default values',
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
    } else if (isKnownPlaceholder(value.MSG91_AUTH_KEY)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MSG91_AUTH_KEY'],
        message: 'Production SMS provider credentials must not use a placeholder',
      });
    }
    if (!value.MSG91_OTP_TEMPLATE_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MSG91_OTP_TEMPLATE_ID'],
        message: 'Production OTP template configuration is required',
      });
    } else if (isKnownPlaceholder(value.MSG91_OTP_TEMPLATE_ID)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MSG91_OTP_TEMPLATE_ID'],
        message: 'Production OTP template configuration must not use a placeholder',
      });
    }
    if (!value.MSG91_OTP_VARIABLE_NAME) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MSG91_OTP_VARIABLE_NAME'],
        message: 'Production OTP template variable configuration is required',
      });
    }

    if (!value.MAPS_API_KEY || isKnownPlaceholder(value.MAPS_API_KEY)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MAPS_API_KEY'],
        message: 'Production MAPS_API_KEY must be a real provider credential',
      });
    }

    if (!value.RAZORPAY_KEY_ID || isKnownPlaceholder(value.RAZORPAY_KEY_ID) || /^rzp_test_/i.test(value.RAZORPAY_KEY_ID)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RAZORPAY_KEY_ID'],
        message: 'Production RAZORPAY_KEY_ID must be a live provider credential',
      });
    }
    if (!value.RAZORPAY_KEY_SECRET || isKnownPlaceholder(value.RAZORPAY_KEY_SECRET)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RAZORPAY_KEY_SECRET'],
        message: 'Production RAZORPAY_KEY_SECRET must be a real provider credential',
      });
    }
  });

export type RuntimeEnv = z.infer<typeof rootSchema>;

export function parseRuntimeConfig(source: Record<string, unknown>): RuntimeEnv {
  const parsed = rootSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');
    throw new RuntimeConfigError(`Invalid runtime configuration: ${issues}`);
  }
  return parsed.data;
}

let envPath = path.resolve(process.cwd(), '../../.env');
if (!fs.existsSync(envPath)) envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export const env = parseRuntimeConfig(process.env);

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
  mapsApiKey: env.MAPS_API_KEY,
  razorpayKeyId: env.RAZORPAY_KEY_ID,
  razorpayKeySecret: env.RAZORPAY_KEY_SECRET,
};
