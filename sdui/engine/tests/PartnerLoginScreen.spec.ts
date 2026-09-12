import { describe, expect, it } from 'vitest';
import { PartnerLoginScreen, SduiValidator } from '../src/index.js';

describe('PartnerLoginScreen', () => {
  it('builds a canonical Partner login screen with request-first auth behavior', () => {
    const screen = new PartnerLoginScreen().build({});
    const validated = new SduiValidator().validate(screen);

    expect(validated.screenId).toBe('partner_login');
    expect(validated.targetApp).toBe('PARTNER');
    expect(validated.template.id).toBe('tpl_7K2M9Q');
    expect(validated.template.type).toBe('form_template');

    const loginComponent = validated.template.components.find(component => component.id === 'login_content');
    expect(loginComponent).toBeDefined();
    expect(loginComponent).toMatchObject({
      sections: expect.arrayContaining([
        expect.objectContaining({
          id: 'mobile_field_section',
          groups: [expect.objectContaining({
            id: 'mobile_field',
            elements: expect.arrayContaining([
              expect.objectContaining({
                id: 'mobile_number',
                type: 'input',
                binding: { key: 'mobileNumber' },
              }),
            ]),
          })],
        }),
        expect.objectContaining({
          id: 'action_section',
          elements: expect.arrayContaining([
            expect.objectContaining({
              id: 'continue_button',
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
                    navigationMode: 'push',
                    contextUpdates: {
                      authFlow: {
                        phoneNumber: { $binding: 'mobileNumber' },
                      },
                    },
                  },
                },
              },
            }),
          ]),
        }),
      ]),
    });
  });

  it('does not embed the OTP screen inside the Continue action', () => {
    const screen = new PartnerLoginScreen().build({});
    const login = screen.template.components.find(component => component.id === 'login_content');
    const actionSection = login && 'sections' in login
      ? login.sections.find(section => section.id === 'action_section')
      : undefined;
    const continueButton = actionSection && 'elements' in actionSection
      ? actionSection.elements.find(element => element.id === 'continue_button')
      : undefined;
    const onClick = continueButton?.actions?.onClick;

    expect(onClick?.type).toBe('request');
    expect(onClick).not.toHaveProperty('payload.screenId');
    expect(onClick).not.toHaveProperty('payload.template');
    expect(onClick).not.toHaveProperty('payload.components');
  });
});
