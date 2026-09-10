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
  it('builds the frozen Login-aligned OTP screen with aggregate binding and hidden resend cooldown', () => {
    const validator = new SduiValidator();
    const validated = validator.validate(new PartnerOtpScreen().build({}));

    expect(validated.screenId).toBe('partner_otp');
    expect(validated.targetApp).toBe('PARTNER');
    expect(validated.template.id).toBe('tpl_P6X8N3');
    expect(validated.template.type).toBe('form_template');
    expect(validated.template.components).toHaveLength(2);
    expect(validated.template.properties).toMatchObject({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 24 },
      padding: { start: 24, top: 20, end: 24, bottom: 20 },
      semanticRole: 'form',
    });

    const brand = validated.template.components[0];
    expect(brand).toMatchObject({
      id: 'otp_brand_content',
      type: 'stack_component',
      elements: [
        { id: 'otp_brand_logo', type: 'image', properties: { url: '/images/carbroz_logo.png' } },
        { id: 'otp_brand_name', type: 'text', properties: { text: 'CarBroz' } },
        {
          id: 'otp_partner_label',
          type: 'text',
          properties: {
            text: 'PARTNER',
            leading: [{ type: 'divider', properties: { orientation: 'horizontal' } }],
            trailing: [{ type: 'divider', properties: { orientation: 'horizontal' } }],
          },
        },
        { id: 'otp_brand_tagline', type: 'text', properties: { text: 'Premium Car Care At Your Doorstep' } },
        {
          id: 'otp_screen_title',
          type: 'text',
          properties: {
            spans: [
              { text: 'Verify ' },
              { text: 'Your', color: '#13B8B5' },
              { text: ' Number' },
            ],
          },
        },
        { id: 'otp_screen_subtitle', type: 'text', properties: { text: 'We have sent a 6-digit code to' } },
        {
          id: 'otp_phone_number',
          type: 'text',
          properties: {
            spans: [
              { text: '+91 ' },
              { text: { $context: 'authFlow.phoneNumber' }, fontWeight: 600 },
            ],
            trailing: [{ type: 'icon', properties: { name: 'edit' } }],
          },
          actions: {
            onClick: {
              type: 'navigate',
              payload: {
                screenId: 'partner_login',
                templateId: 'tpl_7K2M9Q',
                templateType: 'stack_template',
                endpoint: '/api/v1/partner/screen/auth_login',
                method: 'GET',
                authentication: 'NONE',
              },
            },
          },
        },
      ],
    });

    const otpContent = validated.template.components[1];
    expect(otpContent).toMatchObject({
      id: 'otp_content',
      type: 'stack_component',
      sections: [
        {
          id: 'otp_field_section',
          type: 'stack_section',
          groups: [{
            id: 'otp_fields_group',
            type: 'stack_group',
            elements: [{
              id: 'otp_code_input',
              type: 'input',
              properties: {
                maxLength: 6,
                keyboardType: 'number',
                presentation: {
                  type: 'segmented',
                  count: 6,
                  spacing: 8,
                  segmentWidth: 44,
                  segmentHeight: 52,
                },
              },
              binding: { key: 'otp' },
              validation: { required: true, pattern: '^[0-9]{6}$', message: 'Enter the 6-digit OTP' },
            }],
          }],
        },
        {
          id: 'otp_action_section',
          type: 'stack_section',
          elements: [
            {
              id: 'otp_resend_text',
              type: 'text',
              properties: {
                text: 'Resend OTP',
                enabled: false,
                color: '#13B8B5',
                disabledColor: '#9CA3AF',
              },
              actions: {
                onClick: {
                  type: 'request',
                  payload: {
                    method: 'POST',
                    endpoint: '/api/v1/partner/auth/send_otp',
                    authentication: 'NONE',
                    validate: false,
                    responseMode: 'none',
                    body: {
                      phoneNumber: { $context: 'authFlow.phoneNumber' },
                      deviceId: { $context: 'deviceId' },
                    },
                  },
                },
              },
            },
            {
              id: 'otp_verify_button',
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
            },
            {
              id: 'otp_legal_text',
              type: 'text',
              properties: {
                spans: [
                  { text: 'By continuing, you agree to our ' },
                  {
                    text: 'Terms & Conditions',
                    onClick: { type: 'external_uri', payload: { uri: { $context: 'legal.termsUri' } } },
                  },
                  { text: ' and ' },
                  {
                    text: 'Privacy Policy',
                    onClick: { type: 'external_uri', payload: { uri: { $context: 'legal.privacyUri' } } },
                  },
                ],
              },
            },
          ],
        },
      ],
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
