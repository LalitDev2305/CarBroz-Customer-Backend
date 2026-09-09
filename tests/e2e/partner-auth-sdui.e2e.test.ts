import { randomInt } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { IOtpDeliveryProvider } from '@carbroz/domain-identity';
import { buildApp } from '../../apps/api/src/bootstrap/app.js';
import { getContainer } from '../../apps/api/src/bootstrap/container/index.js';

const bootstrapHeaders = {
  'x-carbroz-platform': 'ANDROID',
  'x-carbroz-app-version': '1.0.0',
  'x-carbroz-build-number': '1',
};
const phoneNumber = `9198${randomInt(10_000_000, 99_999_999)}`;
const deviceId = `phase12-device-${randomInt(100_000, 999_999)}`;
let app: FastifyInstance;
let deliveredOtp = '';

const deliveryProvider: IOtpDeliveryProvider = {
  sendOtp: async ({ otp }) => {
    deliveredOtp = otp;
    return { success: true, providerReference: 'phase12-e2e' };
  },
};

const destination = (value: unknown) => value as {
  screenId: string;
  templateId: string;
  templateType: string;
  endpoint: string;
  method: 'GET';
  authentication: 'NONE' | 'SESSION';
};

beforeAll(async () => {
  app = await buildApp();
  getContainer().register('smsProvider', { resolve: () => deliveryProvider });
});

afterAll(async () => {
  const container = getContainer();
  const prisma = container.resolve('prismaProvider').getClient();
  const existing = await prisma.user.findUnique({ where: { phoneNumber } });
  if (existing) {
    const sessions = await prisma.userSession.findMany({ where: { userId: existing.id }, select: { id: true } });
    const sessionIds = sessions.map(({ id }) => id);
    if (sessionIds.length) await prisma.refreshToken.deleteMany({ where: { sessionId: { in: sessionIds } } });
    await prisma.userSession.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }
  await app.close();
});

describe('Phase 12 Partner auth → SDUI end-to-end contract', () => {
  it('completes guest bootstrap through the migration-published authenticated dashboard without navigation drift or OTP leakage', async () => {
    const guestBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/partner/config/bootstrap',
      headers: bootstrapHeaders,
    });
    expect(guestBootstrapResponse.statusCode).toBe(200);
    const guestBootstrap = guestBootstrapResponse.json();
    const loginDestination = destination(guestBootstrap.data.startup.nextScreen);
    expect(loginDestination).toEqual({
      screenId: 'partner_login',
      templateId: 'tpl_7K2M9Q',
      templateType: 'stack_template',
      endpoint: '/api/v1/partner/screen/auth_login',
      method: 'GET',
      authentication: 'NONE',
    });

    const loginResponse = await app.inject({ method: 'GET', url: loginDestination.endpoint });
    expect(loginResponse.statusCode).toBe(200);
    const loginScreen = loginResponse.json().data;
    expect(loginScreen.screenId).toBe(loginDestination.screenId);
    expect(loginScreen.template.id).toBe(loginDestination.templateId);
    expect(loginScreen.template.type).toBe(loginDestination.templateType);

    const sendOtpResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/partner/auth/send_otp',
      payload: { phoneNumber, deviceId },
    });
    expect(sendOtpResponse.statusCode).toBe(200);
    const sendOtp = sendOtpResponse.json();
    expect(deliveredOtp).toMatch(/^\d{6}$/);
    expect(JSON.stringify(sendOtp)).not.toContain(deliveredOtp);
    expect(JSON.stringify(sendOtp)).not.toContain('otpHash');
    const otpDestination = destination(sendOtp.data.nextScreen);
    expect(otpDestination).toEqual({
      screenId: 'partner_otp',
      templateId: 'tpl_partner_otp_v1',
      templateType: 'form_template',
      endpoint: '/api/v1/partner/screen/auth_otp',
      method: 'GET',
      authentication: 'NONE',
    });

    const otpScreenResponse = await app.inject({ method: 'GET', url: otpDestination.endpoint });
    expect(otpScreenResponse.statusCode).toBe(200);
    const otpScreen = otpScreenResponse.json().data;
    expect(otpScreen.screenId).toBe(otpDestination.screenId);
    expect(otpScreen.template.id).toBe(otpDestination.templateId);
    expect(otpScreen.template.type).toBe(otpDestination.templateType);

    const verifyResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/partner/auth/verify_otp',
      payload: {
        challengeId: sendOtp.data.challengeId,
        phoneNumber,
        otp: deliveredOtp,
        deviceId,
      },
    });
    expect(verifyResponse.statusCode).toBe(200);
    const verify = verifyResponse.json();
    expect(verify.data.token).toEqual(expect.any(String));
    expect(verify.data.refreshToken).toEqual(expect.any(String));
    expect(JSON.stringify(verify)).not.toContain(deliveredOtp);
    expect(JSON.stringify(verify)).not.toContain('otpHash');
    const dashboardDestination = destination(verify.data.nextScreen);
    expect(dashboardDestination).toEqual({
      screenId: 'partner_dashboard',
      templateId: 'partner_dashboard_template',
      templateType: 'default_template',
      endpoint: '/api/v1/partner/sdui/registry/partner_dashboard',
      method: 'GET',
      authentication: 'SESSION',
    });

    const unauthenticatedDashboard = await app.inject({
      method: 'GET',
      url: dashboardDestination.endpoint,
    });
    expect(unauthenticatedDashboard.statusCode).toBe(401);

    const dashboardResponse = await app.inject({
      method: 'GET',
      url: dashboardDestination.endpoint,
      headers: { authorization: `Bearer ${verify.data.token}` },
    });
    expect(dashboardResponse.statusCode).toBe(200);
    const dashboard = dashboardResponse.json().data;
    expect(dashboard.screenId).toBe(dashboardDestination.screenId);
    expect(dashboard.template.id).toBe(dashboardDestination.templateId);
    expect(dashboard.template.type).toBe(dashboardDestination.templateType);

    const authenticatedBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/partner/config/bootstrap',
      headers: { ...bootstrapHeaders, authorization: `Bearer ${verify.data.token}` },
    });
    expect(authenticatedBootstrapResponse.statusCode).toBe(200);
    const authenticatedBootstrap = authenticatedBootstrapResponse.json();
    expect(authenticatedBootstrap.data.startup.authenticated).toBe(true);
    expect(authenticatedBootstrap.data.startup.nextScreen).toEqual(dashboardDestination);
  });
});
