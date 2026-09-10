import { describe, expect, it } from 'vitest';
import { PartnerLoginScreen, SduiValidator } from '../src/index.js';

describe('PartnerLoginScreen', () => {
  it('builds a canonical Partner login screen with frozen auth behavior', () => {
    const screen = new PartnerLoginScreen().build({});
    const validated = new SduiValidator().validate(screen);

    expect(validated.screenId).toBe('partner_login');
    expect(validated.targetApp).toBe('PARTNER');
    expect(validated.template.id).toBe('tpl_7K2M9Q');
    expect(validated.template.type).toBe('stack_template');
    expect(validated.theme).toMatchObject({
      theme: 'light',
      statusBar: 'transparent',
      properties: {
        gradient: {
          type: 'linear',
          angle: 135,
          colors: [
            { color: '#DDF8F6', stop: 0 },
            { color: '#F7FEFD', stop: 0.28 },
            { color: '#FFFFFF', stop: 0.55 },
            { color: '#D9F7F4', stop: 1 },
          ],
        },
      },
    });

    const brandComponent = validated.template.components.find(component => component.id === 'brand_content');
    expect(brandComponent).toMatchObject({
      id: 'brand_content',
      type: 'stack_component',
      elements: expect.arrayContaining([
        {
          id: 'welcome_title',
          type: 'text',
          properties: {
            spans: [
              { text: 'Welcome ' },
              { text: 'Partner!', color: '#13B8B5' },
            ],
          },
        },
      ]),
    });

    const loginComponent = validated.template.components.find(component => component.id === 'login_content');
    expect(loginComponent).toBeDefined();
    expect(loginComponent).toMatchObject({
      id: 'login_content',
      type: 'stack_component',
      sections: [
        {
          id: 'mobile_field_section',
          groups: [
            {
              id: 'mobile_field',
              elements: [
                { id: 'country_code', type: 'text' },
                {
                  id: 'mobile_number',
                  type: 'input',
                  binding: { key: 'mobileNumber' },
                  validation: {
                    required: true,
                    pattern: '^[6-9][0-9]{9}$',
                    message: 'Enter a valid 10-digit mobile number',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'action_section',
          elements: [
            {
              id: 'continue_button',
              type: 'button',
              actions: {
                onClick: {
                  type: 'request',
                  payload: {
                    method: 'POST',
                    endpoint: '/api/v1/partner/auth/send_otp',
                    authentication: 'NONE',
                    validate: true,
                    body: {
                      phoneNumber: { $binding: 'mobileNumber' },
                      deviceId: { $context: 'deviceId' },
                    },
                    responseMode: 'destination',
                  },
                },
              },
            },
            {
              id: 'legal_text',
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
  });
});
