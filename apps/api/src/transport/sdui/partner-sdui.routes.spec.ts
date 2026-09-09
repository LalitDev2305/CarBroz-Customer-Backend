import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerPartnerSduiRoutes } from './partner-sdui.routes.js';

const dashboard = {
  screenId: 'partner_dashboard',
  schemaVersion: '3.0.0',
  targetApp: 'PARTNER',
  template: {
    id: 'partner_dashboard_template',
    type: 'default_template',
    components: [{ id: 'shell', type: 'stack_component', elements: [{ id: 'title', type: 'text', properties: { text: 'Partner Dashboard' } }] }],
  },
};

describe('Partner SDUI Phase 10 registry route', () => {
  const apps: Array<ReturnType<typeof Fastify>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map(async (app) => app.close()));
  });

  it('requires session verification and always retrieves the PARTNER published screen', async () => {
    const execute = vi.fn().mockResolvedValue(dashboard);
    const jwtVerify = vi.fn().mockResolvedValue(undefined);
    const app = Fastify();
    apps.push(app);

    app.decorateRequest('jwtVerify', jwtVerify);
    app.addHook('onRequest', async (request) => {
      request.diScope = {
        resolve: (registrationName: string) => {
          expect(registrationName).toBe('getSduiScreenUseCase');
          return { execute };
        },
      } as typeof request.diScope;
    });

    await app.register(async (partner) => {
      await partner.register(registerPartnerSduiRoutes, { prefix: '/sdui' });
    }, { prefix: '/api/v1/partner' });

    const response = await app.inject({ method: 'GET', url: '/api/v1/partner/sdui/registry/partner_dashboard' });

    expect(response.statusCode).toBe(200);
    expect(jwtVerify).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith({ data: { screenId: 'partner_dashboard', targetApp: 'PARTNER' } });
    expect(response.json().data).toEqual(dashboard);
  });
});
