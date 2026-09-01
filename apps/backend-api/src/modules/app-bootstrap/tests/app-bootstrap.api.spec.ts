import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { asValue } from 'awilix';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../../app.js';
import { getContainer } from '../../../container/index.js';

const headers = {
  'x-carbroz-app-version': '1.0.0',
  'x-carbroz-build-number': '12',
  'x-carbroz-application-id': 'com.carbroz.partner',
  'x-carbroz-bootstrap-schema': '1',
  'x-carbroz-sdui-protocol': '1',
  'x-carbroz-sdui-schema': '1',
};

describe('App Bootstrap API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const container = getContainer();
    container.register({
      configProvider: asValue({
        get: async (_key: string, defaultValue?: unknown) => defaultValue,
      }),
      featureFlagProvider: asValue({
        getAllFlags: async () => ({ bootstrapEnabled: true }),
      }),
      userRepository: asValue({ findById: async () => null }),
      userSessionRepository: asValue({ findById: async () => null }),
      partnerMemberRepository: asValue({ findByUserId: async () => [] }),
      partnerRepository: asValue({ findById: async () => null }),
    });

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the canonical public Splash bootstrap endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/app',
      headers,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.session.authenticated).toBe(false);
    expect(body.data.user).toBeNull();
    expect(body.data.partner).toBeNull();
    expect(body.data.sdui).toEqual({ protocolVersion: 1, schemaVersion: 1 });
    expect(body.data.nextScreen.endpoint).toBe('/api/v1/ui/auth_login');
    expect(body.data.featureFlags.bootstrapEnabled).toBe(true);
    expect(body.traceId).toBeTruthy();
  });

  it('rejects malformed or incomplete client capability headers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/app',
      headers: {
        'x-carbroz-app-version': '1.0.0',
      },
    });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
    expect(response.statusCode).toBeLessThan(500);
  });

  it('does not expose the removed legacy /api/v1/app/init bootstrap path', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/app/init',
      headers,
    });

    expect(response.statusCode).toBe(404);
  });
});
