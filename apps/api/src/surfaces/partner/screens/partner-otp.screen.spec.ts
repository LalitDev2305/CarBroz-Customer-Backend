import { describe, expect, it } from 'vitest';
import { screenSchema } from '@carbroz/sdui-engine';
import { VerifyOtpSchema } from '../../../transport/auth/dto/auth.dto.js';
import { createPartnerOtpScreen } from './partner-otp.screen.js';

function findNodeById(value: unknown, id: string): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findNodeById(item, id);
      if (found) return found;
    }
    return null;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.id === id) return record;
    for (const child of Object.values(record)) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }

  return null;
}

describe('Partner OTP Phase 8 SDUI contract', () => {
  it('implements the exact Phase 6 reserved destination identity as a canonical loaded screen', () => {
    const screen = createPartnerOtpScreen();

    expect(screenSchema.parse(screen)).toEqual(screen);
    expect(screen.screenId).toBe('partner_otp');
    expect(screen.template.id).toBe('tpl_partner_otp_v1');
    expect(screen.template.type).toBe('form_template');
    expect(screen.targetApp).toBe('PARTNER');
    expect(screen).not.toHaveProperty('templateId');
    expect(screen).not.toHaveProperty('templateType');
  });

  it('uses only the existing generic request/reference vocabulary for Verify OTP', () => {
    const screen = createPartnerOtpScreen();
    const verifyButton = findNodeById(screen, 'verify_otp_button');
    expect(verifyButton).not.toBeNull();

    const actions = verifyButton?.actions as Record<string, unknown>;
    const onClick = actions.onClick as Record<string, unknown>;
    const payload = onClick.payload as Record<string, unknown>;

    expect(onClick.type).toBe('request');
    expect(payload).toMatchObject({
      method: 'POST',
      endpoint: '/api/v1/partner/auth/verify_otp',
      authentication: 'NONE',
      validate: true,
      responseMode: 'destination',
      body: {
        challengeId: { $response: 'data.challengeId' },
        phoneNumber: { $context: 'authFlow.phoneNumber' },
        otp: { $binding: 'otp' },
        deviceId: { $context: 'deviceId' },
      },
    });
  });

  it('keeps the resolved request compatible with the canonical VerifyOtpSchema', () => {
    expect(VerifyOtpSchema.parse({
      challengeId: '11111111-1111-4111-8111-111111111111',
      phoneNumber: '9876543210',
      otp: '654321',
      deviceId: 'device-123',
    })).toEqual({
      challengeId: '11111111-1111-4111-8111-111111111111',
      phoneNumber: '9876543210',
      otp: '654321',
      deviceId: 'device-123',
    });
  });
});
