import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { appSchema } from './AppConfig.js';
import { databaseSchema } from './DatabaseConfig.js';
import { jwtSchema } from './JwtConfig.js';
import { redisSchema } from './RedisConfig.js';
import { loggingSchema } from './LoggingConfig.js';
import { securitySchema } from './SecurityConfig.js';
import { providersSchema } from './ProvidersConfig.js';
let envPath = path.resolve(process.cwd(), '../../.env');
if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), '.env');
}
dotenv.config({ path: envPath });
const rootSchema = appSchema
    .merge(databaseSchema)
    .merge(jwtSchema)
    .merge(redisSchema)
    .merge(loggingSchema)
    .merge(securitySchema)
    .merge(providersSchema);
const _env = rootSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}
export const env = _env.data;
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
export * from './providers/ConfigProvider.js';
//# sourceMappingURL=index.js.map