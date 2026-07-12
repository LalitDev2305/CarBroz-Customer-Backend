export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    HOST: string;
    LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_ACCESS_EXPIRATION: string;
    JWT_REFRESH_EXPIRATION: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    MINIO_ENDPOINT: string;
    MINIO_PORT: number;
    MINIO_USE_SSL: boolean;
    MINIO_ACCESS_KEY: string;
    MINIO_SECRET_KEY: string;
    CORS_ORIGIN: string;
};
export declare const AppConfig: {
    env: "development" | "test" | "production";
    port: number;
    host: string;
    logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
};
export declare const DatabaseConfig: {
    url: string;
};
export declare const RedisConfig: {
    url: string;
};
export declare const JwtConfig: {
    secret: string;
    accessExpiration: string;
    refreshExpiration: string;
    issuer: string;
    audience: string;
};
export declare const MinioConfig: {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
};
export declare const SecurityConfig: {
    corsOrigin: string;
};
