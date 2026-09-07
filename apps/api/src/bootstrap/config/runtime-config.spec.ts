import { describe, expect, it } from 'vitest';
import {
  appSchema,
  databaseSchema,
  parseRuntimeConfig,
  providersSchema,
  RuntimeConfigError,
} from './runtime-config.js';

function secureProductionConfig(): Record<string, string | boolean> {
  return {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://carbroz_app:strong-db-password@db.internal:5432/carbroz',
    JWT_SECRET: 'carbroz-production-jwt-secret-8f3c2b7a1d9e4f6c',
    REDIS_URL: 'redis://cache.internal:6379',
    CORS_ORIGIN: 'https://app.carbroz.com',
    MINIO_ENDPOINT: 'objects.internal',
    MINIO_PORT: '9000',
    MINIO_USE_SSL: 'true',
    MINIO_ACCESS_KEY: 'carbroz-prod-storage-access',
    MINIO_SECRET_KEY: 'carbroz-prod-storage-secret-7e5d9a',
    MSG91_AUTH_KEY: 'msg91-production-auth-key',
    MSG91_OTP_TEMPLATE_ID: 'otp-production-template',
    MSG91_OTP_VARIABLE_NAME: 'otp',
    MAPS_API_KEY: 'google-maps-production-key',
    RAZORPAY_KEY_ID: 'rzp_live_carbrozproduction',
    RAZORPAY_KEY_SECRET: 'razorpay-production-secret',
  };
}

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

  it('rejects invalid and non-PostgreSQL database URLs', () => {
    expect(databaseSchema.safeParse({ DATABASE_URL: 'invalid-url' }).success).toBe(false);
    expect(databaseSchema.safeParse({ DATABASE_URL: 'mysql://db.internal/carbroz' }).success).toBe(false);
  });

  it('parses explicit false boolean environment values without coercing them to true', () => {
    const result = providersSchema.safeParse({ MINIO_USE_SSL: 'false' });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.MINIO_USE_SSL).toBe(false);
  });

  it('accepts secure explicit production configuration', () => {
    const config = parseRuntimeConfig(secureProductionConfig());

    expect(config.NODE_ENV).toBe('production');
    expect(config.MINIO_USE_SSL).toBe(true);
    expect(config.RAZORPAY_KEY_ID).toMatch(/^rzp_live_/);
  });

  it.each([
    ['DATABASE_URL', 'postgresql://postgres:postgres@db.internal:5432/carbroz'],
    ['DATABASE_URL', 'postgresql://carbroz:strong-password@localhost:5432/carbroz'],
    ['JWT_SECRET', 'replace_with_a_long_random_jwt_secret'],
    ['MINIO_ACCESS_KEY', 'minioadmin'],
    ['MINIO_SECRET_KEY', 'replace_with_minio_secret_key'],
    ['MSG91_AUTH_KEY', 'replace_with_msg91_auth_key'],
    ['MSG91_OTP_TEMPLATE_ID', 'replace_with_msg91_otp_template_id'],
    ['MAPS_API_KEY', 'mock'],
    ['RAZORPAY_KEY_ID', 'rzp_test_dummy'],
    ['RAZORPAY_KEY_SECRET', 'dummy_secret'],
  ])('rejects unsafe production %s value', (key, value) => {
    expect(() => parseRuntimeConfig({
      ...secureProductionConfig(),
      [key]: value,
    })).toThrow(RuntimeConfigError);
  });

  it.each([
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'MSG91_AUTH_KEY',
    'MSG91_OTP_TEMPLATE_ID',
    'MSG91_OTP_VARIABLE_NAME',
    'MAPS_API_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
  ])('rejects missing production provider configuration: %s', (key) => {
    expect(() => parseRuntimeConfig({
      ...secureProductionConfig(),
      [key]: undefined,
    })).toThrow(RuntimeConfigError);
  });

  it('rejects production object storage when TLS is explicitly disabled', () => {
    expect(() => parseRuntimeConfig({
      ...secureProductionConfig(),
      MINIO_USE_SSL: 'false',
    })).toThrow(RuntimeConfigError);
  });
});
