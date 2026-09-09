import { describe, expect, it } from 'vitest';
import { SendOtpSchema } from '../../../transport/auth/dto/auth.dto.js';
import { createPartnerLoginScreen } from './partner-login.screen.js';

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

describe('Partner Login Phase 5 request contract', () => {
  it('keeps screen identity and emits the exact generic Send OTP request mapping', () => {
    const screen = createPartnerLoginScreen();

    expect(screen.screenId).toBe('partner_login');
    expect(screen.template.id).toBe('tpl_7K2M9Q');
    expect(screen.template.type).toBe('stack_template');
    expect(screen.targetApp).toBe('PARTNER');

    const continueButton = findNodeById(screen, 'continue_button');
    expect(continueButton).not.toBeNull();

    const actions = continueButton?.actions as Record<string, unknown>;
    const onClick = actions.onClick as Record<string, unknown>;
    const payload = onClick.payload as Record<string, unknown>;

    expect(onClick.type).toBe('request');
    expect(payload.method).toBe('POST');
    expect(payload.endpoint).toBe('/api/v1/partner/auth/send_otp');
    expect(payload.authentication).toBe('NONE');
    expect(payload.validate).toBe(true);
    expect(payload.responseMode).toBe('destination');
    expect(payload.body).toEqual({
      phoneNumber: { $binding: 'mobileNumber' },
      deviceId: { $context: 'deviceId' },
    });
    expect((payload.body as Record<string, unknown>).mobileNumber).toBeUndefined();
  });

  it('keeps deviceId in runtime context rather than introducing a device input element', () => {
    const screen = createPartnerLoginScreen();
    const serialized = JSON.stringify(screen);

    expect(serialized).toContain('"$context":"deviceId"');
    expect(serialized).not.toContain('"binding":{"key":"deviceId"}');
    expect(findNodeById(screen, 'deviceId')).toBeNull();
  });

  it('matches the existing shared SendOtpSchema after generic references are resolved', () => {
    expect(SendOtpSchema.parse({
      phoneNumber: '9876543210',
      deviceId: 'device-123',
    })).toEqual({
      phoneNumber: '9876543210',
      deviceId: 'device-123',
    });
  });
});
