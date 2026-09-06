import { describe, expect, it } from 'vitest';
import { appSchema, databaseSchema, parseRuntimeConfig, RuntimeConfigError } from './runtime-config.js';

describe('runtime configuration', () => {
  it('validates valid app configuration and coerces the port', () => {
    const result = appSchema.safeParse({ NODE_ENV: 'development', PORT: '3000', HOST: '127.0.0.1' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.HOST).toBe('127.0.0.1');
    }
  });

  it('rejects an invalid or non-PostgreSQL database URL', () => {
    expect(databaseSchema.safeParse({ DATABASE_URL: 'invalid-url' }).success).toBe(false);
    expect(databaseSchema.safeParse({ DATABASE_URL: 'mysql://localhost/carbroz' }).success).toBe(false);
  });

  it('rejects unsafe production defaults without exiting the process', () => {
    expect(() => parseRuntimeConfig({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:password@db/carbroz',
      JWT_SECRET: '1234567890123456',
      CORS_ORIGIN: '*',
      OTP_PROVIDER_MODE: 'mock',
    })).toThrow(RuntimeConfigError);
  });

  it('accepts hardened production security inputs', () => {
    const config = parseRuntimeConfig({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:password@db/carbroz',
      JWT_SECRET: 'jwt-secret-that-is-at-least-32-chars-long',
      AUTH_TOKEN_PEPPER: 'token-pepper-that-is-at-least-32-chars',
      CORS_ORIGIN: 'https://app.carbroz.com',
      OTP_PROVIDER_MODE: 'provider',
      MINIO_ACCESS_KEY: 'access-key',
      MINIO_SECRET_KEY: 'secret-key',
    });
    expect(config.NODE_ENV).toBe('production');
    expect(config.OTP_PROVIDER_MODE).toBe('provider');
  });
});
