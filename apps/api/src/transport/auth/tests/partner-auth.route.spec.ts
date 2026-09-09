import Fastify from 'fastify';
import { dynamicDestinationSchema } from '@carbroz/ui-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerPartnerAuthRoutes } from '../partner-auth.routes.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

describe('Partner Auth Phase 5/6 route contract', () => {
  const apps: Array<ReturnType<typeof Fastify>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map(async (app) => app.close()));
  });

  it('mounts Send OTP at the exact Partner URL, forwards the canonical body, and returns a valid destination', async () => {
    const nextScreen = {
      screenId: 'partner_otp',
      templateId: 'tpl_partner_otp_v1',
      templateType: 'form_template',
      endpoint: '/api/v1/partner/screen/auth_otp',
      method: 'GET' as const,
      authentication: 'NONE' as const,
    };
    const execute = vi.fn().mockResolvedValue({
      message: 'OTP sent successfully',
      challengeId: 'challenge-123',
      expiresInSeconds: 300,
      isNewUser: true,
      nextScreen,
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

    const envelope: unknown = response.json();
    expect(isRecord(envelope)).toBe(true);
    if (!isRecord(envelope)) throw new Error('Expected a response envelope object');

    expect(envelope.status).toBe(200);
    expect(envelope.code).toBe('SUCCESS');
    expect(isRecord(envelope.data)).toBe(true);
    if (!isRecord(envelope.data)) throw new Error('Expected response envelope data object');

    const parsedDestination = dynamicDestinationSchema.parse(envelope.data.nextScreen);
    expect(parsedDestination).toEqual(nextScreen);
    expect(parsedDestination).not.toHaveProperty('template');
    expect(parsedDestination).not.toHaveProperty('api');
  });
});
