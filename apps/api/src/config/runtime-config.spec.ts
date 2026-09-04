import { describe, expect, it } from 'vitest';
import { appSchema, databaseSchema } from './runtime-config.js';

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
});
