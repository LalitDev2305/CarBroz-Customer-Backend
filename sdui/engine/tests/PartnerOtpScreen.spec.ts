import { describe, expect, it } from 'vitest';
import { PartnerOtpScreen, SduiValidator } from '../src/index.js';

describe('PartnerOtpScreen', () => {
  it('builds the canonical Partner OTP screen and verify request', () => {
    const validated = new SduiValidator().validate(new PartnerOtpScreen().build({}));

    expect(validated.screenId).toBe('partner_otp');
    expect(validated.targetApp).toBe('PARTNER');
    expect(validated.template.id).toBe('tpl_partner_otp_v1');
    expect(validated.template.type).toBe('form_template');
    expect(validated.template.properties).toMatchObject({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 24 },
      padding: { start: 24, top: 32, end: 24, bottom: 24 },
      semanticRole: 'form',
    });

    const form = validated.template.components.find(component => component.id === 'otp_form');
    expect(form).toBeDefined();
    expect(form).toMatchObject({
      sections: [
        {
          id: 'otp_input_section',
          elements: [{
            id: 'otp_input',
            type: 'input',
            binding: { key: 'otp' },
            validation: { required: true, pattern: '^[0-9]{6}$', message: 'Enter the 6-digit OTP' },
          }],
        },
        {
          id: 'otp_action_section',
          elements: [{
            id: 'verify_otp_button',
            type: 'button',
            actions: {
              onClick: {
                type: 'request',
                payload: {
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
                },
              },
            },
          }],
        },
      ],
    });
  });
});
