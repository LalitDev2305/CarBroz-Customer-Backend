import Fastify from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { dynamicDestinationSchema, screenSchema } from '@carbroz/sdui-engine';
import { partnerOtpRoutes } from './partner-otp.routes.js';

const reservedDestination = dynamicDestinationSchema.parse({
  screenId: 'partner_otp',
  templateId: 'tpl_partner_otp_v1',
  templateType: 'form_template',
  endpoint: '/api/v1/partner/screen/auth_otp',
  method: 'GET',
  authentication: 'NONE',
});

describe('Partner OTP Phase 8 route contract', () => {
  const apps: Array<ReturnType<typeof Fastify>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map(async (app) => app.close()));
  });

  it('serves the exact reserved guest destination as a canonical loaded screen', async () => {
    const app = Fastify();
    apps.push(app);

    await app.register(async (partnerSurface) => {
      await partnerSurface.register(partnerOtpRoutes, { prefix: '/screen' });
    }, { prefix: '/api/v1/partner' });

    const response = await app.inject({ method: 'GET', url: reservedDestination.endpoint });
    expect(response.statusCode).toBe(200);

    const envelope = response.json() as {
      status: number;
      code: string;
      data: unknown;
    };
    expect(envelope.status).toBe(200);
    expect(envelope.code).toBe('SUCCESS');

    const screen = screenSchema.parse(envelope.data);
    expect(screen.screenId).toBe(reservedDestination.screenId);
    expect(screen.template.id).toBe(reservedDestination.templateId);
    expect(screen.template.type).toBe(reservedDestination.templateType);
  });
});
