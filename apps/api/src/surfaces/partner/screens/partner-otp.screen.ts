import { screenSchema, type SduiScreen } from '@carbroz/ui-sdk';

/**
 * Public Partner OTP SDUI composition.
 * OTP verification business/security behavior remains owned by Identity.
 */
export function createPartnerOtpScreen(): SduiScreen {
  return screenSchema.parse({
    screenId: 'partner_otp',
    schemaVersion: '3.0.0',
    targetApp: 'PARTNER',
    theme: {
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
    },
    template: {
      id: 'tpl_partner_otp_v1',
      type: 'form_template',
      properties: {
        orientation: 'vertical',
        verticalArrangement: { type: 'spacedBy', spacing: 24 },
        horizontalAlignment: 'center',
        fillMaxSize: true,
        padding: { start: 24, top: 32, end: 24, bottom: 24 },
      },
      components: [
        {
          id: 'otp_header',
          type: 'stack_component',
          properties: {
            orientation: 'vertical',
            verticalArrangement: { type: 'spacedBy', spacing: 8 },
            horizontalAlignment: 'center',
            fillMaxWidth: true,
          },
          elements: [
            {
              id: 'otp_title',
              type: 'text',
              properties: {
                text: 'Verify OTP',
                fontSize: 30,
                fontWeight: 700,
                color: '#101522',
                textAlign: 'center',
              },
            },
            {
              id: 'otp_subtitle',
              type: 'text',
              properties: {
                text: 'Enter the 6-digit code sent to your mobile number',
                fontSize: 15,
                fontWeight: 400,
                color: '#6B7078',
                textAlign: 'center',
                fillMaxWidth: true,
              },
            },
          ],
        },
        {
          id: 'otp_form',
          type: 'stack_component',
          properties: {
            orientation: 'vertical',
            verticalArrangement: { type: 'spacedBy', spacing: 16 },
            horizontalAlignment: 'center',
            fillMaxWidth: true,
          },
          sections: [
            {
              id: 'otp_input_section',
              type: 'stack_section',
              properties: {
                orientation: 'vertical',
                horizontalAlignment: 'center',
                fillMaxWidth: true,
              },
              elements: [
                {
                  id: 'otp_input',
                  type: 'input',
                  properties: {
                    placeholder: '000000',
                    keyboardType: 'number',
                    maxLength: 6,
                    fillMaxWidth: true,
                    height: 56,
                    textAlign: 'center',
                  },
                  binding: { key: 'otp' },
                  validation: {
                    required: true,
                    pattern: '^[0-9]{6}$',
                    message: 'Enter the 6-digit OTP',
                  },
                },
              ],
            },
            {
              id: 'otp_action_section',
              type: 'stack_section',
              properties: {
                orientation: 'vertical',
                verticalArrangement: { type: 'spacedBy', spacing: 12 },
                horizontalAlignment: 'center',
                fillMaxWidth: true,
              },
              elements: [
                {
                  id: 'verify_otp_button',
                  type: 'button',
                  properties: {
                    text: 'Verify & Continue',
                    fillMaxWidth: true,
                    height: 56,
                    fontSize: 18,
                    fontWeight: 600,
                    textColor: '#FFFFFF',
                    shape: { type: 'roundedCorner', cornerRadius: 16 },
                    background: {
                      type: 'linearGradient',
                      angle: 90,
                      colors: [
                        { color: '#28CBC7', stop: 0 },
                        { color: '#10B6B3', stop: 1 },
                      ],
                    },
                  },
                  actions: {
                    onClick: {
                      type: 'request',
                      payload: {
                        method: 'POST',
                        endpoint: '/api/v1/partner/auth/verify_otp',
                        authentication: 'NONE',
                        validate: true,
                        body: {
                          challengeId: { $response: 'data.challengeId' },
                          phoneNumber: { $context: 'authFlow.phoneNumber' },
                          otp: { $binding: 'otp' },
                          deviceId: { $context: 'deviceId' },
                        },
                        responseMode: 'destination',
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  });
}
