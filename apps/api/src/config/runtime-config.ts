import * as dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

export const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
});

export const databaseSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  JWT_ISSUER: z.string().default('carbroz.com'),
  JWT_AUDIENCE: z.string().default('carbroz-users'),
});

export const redisSchema = z.object({
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
});

export const loggingSchema = z.object({
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export const securitySchema = z.object({
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export const providersSchema = z.object({
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
});

const rootSchema = appSchema
  .merge(databaseSchema)
  .merge(jwtSchema)
  .merge(redisSchema)
  .merge(loggingSchema)
  .merge(securitySchema)
  .merge(providersSchema);

let envPath = path.resolve(process.cwd(), '../../.env');
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(process.cwd(), '.env');
}
dotenv.config({ path: envPath });

const parsedEnv = rootSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

export const AppConfig = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
};

export const DatabaseConfig = {
  url: env.DATABASE_URL,
};

export const JwtConfig = {
  secret: env.JWT_SECRET,
  accessExpiration: env.JWT_ACCESS_EXPIRATION,
  refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
};

export const RedisConfig = {
  url: env.REDIS_URL,
};

export const LoggingConfig = {
  logLevel: env.LOG_LEVEL,
};

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
