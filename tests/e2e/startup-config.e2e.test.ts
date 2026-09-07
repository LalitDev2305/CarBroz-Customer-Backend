import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../apps/api/src/bootstrap/app.js';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;

afterEach(async () => {
  if (app) await app.close();
  app = undefined;
});

describe('Customer startup configuration API', () => {
  it('serves the unauthenticated startup snapshot through the final Fastify composition root', async () => {
    app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/customer/config/init',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: {
        maintenance: { enabled: false, message: '' },
        forceUpdate: {
          android: { minVersion: '1.0.0', latestVersion: '1.0.0' },
          ios: { minVersion: '1.0.0', latestVersion: '1.0.0' },
        },
        featureFlags: {},
        startupRouting: {
          guest: { destination: 'auth_template', api: 'auth/auth_login' },
          authenticated: { destination: 'dashboard_template', api: 'dashboard/home' },
        },
      },
    });
  });

  it('does not require an Authorization header during application bootstrap', async () => {
    app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/customer/config/init',
      headers: { accept: 'application/json' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['www-authenticate']).toBeUndefined();
  });
});
