import { describe, expect, it } from 'vitest';
import { PartnerLoginScreen, PartnerOtpScreen, SduiValidator, type SduiScreen } from '../src/index.js';

function collectIds(screen: SduiScreen): string[] {
  const ids = [screen.template.id];
  for (const component of screen.template.components) {
    ids.push(component.id);
    if ('elements' in component) {
      for (const element of component.elements) ids.push(element.id);
      continue;
    }
    for (const section of component.sections) {
      ids.push(section.id);
      if ('elements' in section) {
        for (const element of section.elements) ids.push(element.id);
        continue;
      }
      for (const group of section.groups) {
        ids.push(group.id);
        for (const element of group.elements) ids.push(element.id);
      }
    }
  }
  return ids;
}

describe('PartnerOtpScreen', () => {
  it('builds the frozen Login-aligned OTP screen with response/context references', () => {
    const validator = new SduiValidator();
    const validated = validator.validate(new PartnerOtpScreen().build({}));

    expect(validated.screenId).toBe('partner_otp');
    expect(validated.targetApp).toBe('PARTNER');
    expect(validated.template.id).toBe('tpl_P6X8N3');
    expect(validated.template.type).toBe('form_template');

    const brand = validated.template.components.find(component => component.id === 'otp_brand_content');
    expect(brand).toBeDefined();
    const phone = brand && 'elements' in brand
      ? brand.elements.find(element => element.id === 'otp_phone_number')
      : undefined;
    expect(phone).toMatchObject({
      properties: {
        spans: [
          { text: '+91 ' },
          { text: { $context: 'authFlow.phoneNumber' }, fontWeight: 600 },
        ],
      },
      actions: {
        onClick: {
          type: 'navigate',
          navigationMode: 'reset',
          payload: {
            screenId: 'partner_login',
            templateId: 'tpl_7K2M9Q',
            templateType: 'form_template',
            endpoint: '/api/v1/partner/screen/auth_login',
            method: 'GET',
            authentication: 'NONE',
          },
        },
      },
    });

    const otpContent = validated.template.components.find(component => component.id === 'otp_content');
    const actionSection = otpContent && 'sections' in otpContent
      ? otpContent.sections.find(section => section.id === 'otp_action_section')
      : undefined;
    const elements = actionSection && 'elements' in actionSection ? actionSection.elements : [];

    expect(elements.find(element => element.id === 'otp_resend_text')).toMatchObject({
      properties: { enabled: false },
      actions: {
        onClick: {
          type: 'request',
          payload: {
            method: 'POST',
            endpoint: '/api/v1/partner/auth/send_otp',
            authentication: 'NONE',
            validate: false,
            responseMode: 'none',
            navigationMode: 'push',
            body: {
              phoneNumber: { $context: 'authFlow.phoneNumber' },
              deviceId: { $context: 'deviceId' },
            },
          },
        },
      },
    });

    expect(elements.find(element => element.id === 'otp_verify_button')).toMatchObject({
      actions: {
        onClick: {
          type: 'request',
          payload: {
            method: 'POST',
            endpoint: '/api/v1/partner/auth/verify_otp',
            authentication: 'NONE',
            validate: true,
            responseMode: 'destination',
            navigationMode: 'reset',
            body: {
              challengeId: { $response: 'data.challengeId' },
              phoneNumber: { $context: 'authFlow.phoneNumber' },
              otp: { $binding: 'otp' },
              deviceId: { $context: 'deviceId' },
            },
          },
        },
      },
    });

    const serialized = JSON.stringify(validated);
    expect(serialized).not.toContain('Resend OTP in');
    expect(serialized).not.toMatch(/\b\d{2}:\d{2}\b/);

    const otpIds = collectIds(validated);
    expect(new Set(otpIds).size).toBe(otpIds.length);
    const loginIds = new Set(collectIds(validator.validate(new PartnerLoginScreen().build({}))));
    expect(otpIds.some(id => loginIds.has(id))).toBe(false);
  });
});
