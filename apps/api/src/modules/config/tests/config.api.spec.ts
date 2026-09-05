import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { asValue } from 'awilix';
import type { InitConfigSnapshot } from '@carbroz/domain-configuration';
import { buildApp } from '../../../app.js';
import { getContainer } from '../../../container/index.js';

const bootstrapSnapshot: InitConfigSnapshot = {
  maintenance: {
    enabled: true,
    message: 'Testing config API',
  },
  forceUpdate: {
    android: { minVersion: '1.0.0', latestVersion: '1.2.0' },
    ios: { minVersion: '2.0.0', latestVersion: '2.2.0' },
  },
  featureFlags: {
    'new-ui': true,
    'beta-feature': false,
    testFlag: true,
  },
  startupRouting: {
    guest: { destination: 'auth_template', api: 'auth/auth_login' },
    authenticated: { destination: 'dashboard_template', api: 'dashboard/home' },
  },
};

describe('Config API', () => {
  let app: FastifyInstance | undefined;

  beforeAll(async () => {
    const container = getContainer();
    // The HTTP surface is tested against the Configuration application contract rather than
    // replacing its persistence/providers, keeping the transport test independent of internals.
    container.register({
      getInitConfigUseCase: asValue({
        execute: async () => bootstrapSnapshot,
      }),
    });

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('returns the complete frontend bootstrap snapshot from the canonical API namespace', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/api/v1/config/init',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: bootstrapSnapshot,
    });
  });

  it('does not expose the obsolete /v1 config namespace', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/v1/config/init',
    });

    expect(response.statusCode).toBe(404);
  });
});
