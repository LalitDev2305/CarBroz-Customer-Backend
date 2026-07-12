import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
let envPath = path.resolve(process.cwd(), '../../.env');
if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), '.env'); // Fallback if ran from root
}
dotenv.config({ path: envPath });
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    JWT_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
    JWT_ISSUER: z.string().default('carbroz.com'),
    JWT_AUDIENCE: z.string().default('carbroz-users'),
    MINIO_ENDPOINT: z.string().default('localhost'),
    MINIO_PORT: z.coerce.number().default(9000),
    MINIO_USE_SSL: z.coerce.boolean().default(false),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
    CORS_ORIGIN: z.string().default('*'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}
export const env = _env.data;
export const AppConfig = {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    logLevel: env.LOG_LEVEL,
};
export const DatabaseConfig = {
    url: env.DATABASE_URL,
};
export const RedisConfig = {
    url: env.REDIS_URL,
};
export const JwtConfig = {
    secret: env.JWT_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
};
export const MinioConfig = {
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
};
export const SecurityConfig = {
    corsOrigin: env.CORS_ORIGIN,
};
//# sourceMappingURL=index.js.map