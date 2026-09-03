import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../apps/api/src/bootstrap/app.js';
import type { FastifyInstance } from 'fastify';

describe('canonical API surface routing', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes Partner, Customer, Admin and health route families', () => {
    const routes = app.printRoutes();
    expect(routes).toContain('partner');
    expect(routes).toContain('customer');
    expect(routes).toContain('admin');
    expect(routes).toContain('health');
  });

  it('does not expose retired global product route families', () => {
    const routes = app.printRoutes();
    expect(routes).not.toContain('/v1/auth');
    expect(routes).not.toContain('/v1/config');
    expect(routes).not.toContain('/api/v1/app');
    expect(routes).not.toContain('/api/v1/maps');
    expect(routes).not.toContain('/api/v1/sdui');
  });
});
