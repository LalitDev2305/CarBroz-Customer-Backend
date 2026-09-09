import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerPartnerAuthRoutes } from '../partner-auth.routes.js';

describe('Partner Auth Phase 5 route contract', () => {
  const apps: Array<ReturnType<typeof Fastify>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map(async (app) => app.close()));
  });

  it('mounts Send OTP at the exact Partner URL and forwards the canonical request body', async () => {
    const execute = vi.fn().mockResolvedValue({
      challengeId: 'challenge-123',
      nextScreen: { template: 'form_template', api: 'auth/auth_otp' },
    });

    const app = Fastify();
    apps.push(app);

    app.addHook('onRequest', async (request) => {
      request.diScope = {
        resolve: (registrationName: string) => {
          expect(registrationName).toBe('sendOtpUseCase');
          return { execute };
        },
      } as typeof request.diScope;
    });

    await app.register(async (partnerSurface) => {
      await partnerSurface.register(registerPartnerAuthRoutes, { prefix: '/auth' });
    }, { prefix: '/api/v1/partner' });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/partner/auth/send_otp',
      payload: {
        phoneNumber: '9876543210',
        deviceId: 'device-123',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith({
      phoneNumber: '9876543210',
      deviceId: 'device-123',
    });
  });
});
