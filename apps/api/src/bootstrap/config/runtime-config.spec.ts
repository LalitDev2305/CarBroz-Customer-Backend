import { describe, expect, it } from 'vitest';
import { appSchema, databaseSchema, rootSchema } from './runtime-config.js';

describe('runtime configuration', () => {
  it('validates valid app configuration and coerces the port', () => {
    const result = appSchema.safeParse({
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: '127.0.0.1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.HOST).toBe('127.0.0.1');
    }
  });

  it('rejects an invalid database URL', () => {
    const result = databaseSchema.safeParse({ DATABASE_URL: 'invalid-url' });
    expect(result.success).toBe(false);
  });

  it('rejects production bootstrap when the OTP delivery provider is not configured', () => {
    const result = rootSchema.safeParse({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:password@db.example.com:5432/carbroz',
      JWT_SECRET: 'a'.repeat(32),
      REDIS_URL: 'redis://cache.example.com:6379',
      CORS_ORIGIN: 'https://app.carbroz.com',
      MINIO_ENDPOINT: 'objects.example.com',
      MINIO_PORT: 9000,
      MINIO_USE_SSL: true,
      MINIO_ACCESS_KEY: 'access-key',
      MINIO_SECRET_KEY: 'secret-key',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(expect.arrayContaining([
        'MSG91_AUTH_KEY',
        'MSG91_OTP_TEMPLATE_ID',
        'MSG91_OTP_VARIABLE_NAME',
      ]));
    }
  });

  it('accepts production bootstrap when the OTP provider and existing security prerequisites are explicit', () => {
    const result = rootSchema.safeParse({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:password@db.example.com:5432/carbroz',
      JWT_SECRET: 'a'.repeat(32),
      REDIS_URL: 'redis://cache.example.com:6379',
      CORS_ORIGIN: 'https://app.carbroz.com',
      MINIO_ENDPOINT: 'objects.example.com',
      MINIO_PORT: 9000,
      MINIO_USE_SSL: true,
      MINIO_ACCESS_KEY: 'access-key',
      MINIO_SECRET_KEY: 'secret-key',
      MSG91_AUTH_KEY: 'msg91-key',
      MSG91_OTP_TEMPLATE_ID: 'otp-template',
      MSG91_OTP_VARIABLE_NAME: 'otp',
    });

    expect(result.success).toBe(true);
  });
});
