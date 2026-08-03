import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../../app.js';
import { FastifyInstance } from 'fastify';
import { asValue } from 'awilix';
import { getContainer } from '../../../container/index.js';

describe('Health Module', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    app.diContainer.register({
      configProvider: asValue({
        get: async () => 'true',
        has: async () => true,
        getAll: async () => ({})
      }),
      featureFlagProvider: asValue({
        isEnabled: async () => true,
        getAllFlags: async () => ({})
      }),
      databaseProvider: asValue({
        health: async () => true,
        connect: async () => {},
        disconnect: async () => {}
      }),
    });
    
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 OK for liveness check', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/liveness'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: 'ok', type: 'liveness' });
  });

  it('should return 200 OK for readiness check when DB is healthy', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/readiness'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: 'ok', type: 'readiness' });
  });

  it('should return 503 for readiness check when DB is down', async () => {
    app.diContainer.register({
      databaseProvider: asValue({
        health: async () => false,
        connect: async () => {},
        disconnect: async () => {}
      })
    });

    const response = await app.inject({
      method: 'GET',
      url: '/health/readiness'
    });

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.payload)).toEqual({ status: 'error', message: 'Database connection failed' });
  });
});
