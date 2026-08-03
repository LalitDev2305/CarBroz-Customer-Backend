export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    HOST: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_ACCESS_EXPIRATION: string;
    JWT_REFRESH_EXPIRATION: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    REDIS_URL: string;
    LOG_LEVEL: "error" | "fatal" | "warn" | "info" | "debug" | "trace";
    CORS_ORIGIN: string;
    RATE_LIMIT_MAX: number;
    RATE_LIMIT_WINDOW_MS: number;
    MINIO_ENDPOINT: string;
    MINIO_PORT: number;
    MINIO_USE_SSL: boolean;
    MINIO_ACCESS_KEY?: string | undefined;
    MINIO_SECRET_KEY?: string | undefined;
};
export declare const AppConfig: {
    env: "development" | "test" | "production";
    port: number;
    host: string;
};
export declare const DatabaseConfig: {
    url: string;
};
export declare const JwtConfig: {
    secret: string;
    accessExpiration: string;
    refreshExpiration: string;
    issuer: string;
    audience: string;
};
export declare const RedisConfig: {
    url: string;
};
export declare const LoggingConfig: {
    logLevel: "error" | "fatal" | "warn" | "info" | "debug" | "trace";
};
export declare const SecurityConfig: {
    corsOrigin: string;
    rateLimitMax: number;
    rateLimitWindowMs: number;
};
export declare const ProvidersConfig: {
    minioEndpoint: string;
    minioPort: number;
    minioUseSSL: boolean;
    minioAccessKey: string | undefined;
    minioSecretKey: string | undefined;
};
export * from './providers/ConfigProvider.js';
