import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appSchema } from '../src/AppConfig.js';
import { databaseSchema } from '../src/DatabaseConfig.js';

describe('Configuration System', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate valid AppConfig', () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3000';
    process.env.HOST = '127.0.0.1';

    const result = appSchema.safeParse(process.env);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.HOST).toBe('127.0.0.1');
    }
  });

  it('should fail on invalid DatabaseConfig', () => {
    process.env.DATABASE_URL = 'invalid-url';

    const result = databaseSchema.safeParse(process.env);
    expect(result.success).toBe(false);
  });
});
