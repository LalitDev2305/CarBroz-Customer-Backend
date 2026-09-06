import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../apps/api/src/bootstrap/app.js';
let app: Awaited<ReturnType<typeof buildApp>> | undefined;
afterEach(async () => { if (app) await app.close(); app = undefined; });
describe('API executable E2E', () => {
  it('boots the final composition root and serves liveness through Fastify injection', async () => {
    app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/health/liveness' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });
  it('returns a transport-level 404 for an unknown route without leaking implementation details', async () => {
    app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/api/v1/customer/__contract_probe__' });
    expect(response.statusCode).toBe(404);
    expect(response.body).not.toContain('node_modules');
    expect(response.body).not.toContain('Prisma');
  });
});
