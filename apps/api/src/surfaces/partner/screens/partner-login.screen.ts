import { screenSchema, type SduiScreen } from '@carbroz/ui-sdk';

/** Partner Login SDUI composition. Business authentication remains owned by Identity. */
export function createPartnerLoginScreen(): SduiScreen {
  return screenSchema.parse({
    screenId: 'partner_login',
    schemaVersion: '3.0.0',
    targetApp: 'PARTNER',
    theme: {
      theme: 'light',
      statusBar: 'transparent',
      properties: {
        gradient: {
          type: 'linear', angle: 135,
          colors: [
            { color: '#DDF8F6', stop: 0 }, { color: '#F7FEFD', stop: 0.28 },
            { color: '#FFFFFF', stop: 0.55 }, { color: '#D9F7F4', stop: 1 },
          ],
        },
      },
    },
    template: {
      id: 'tpl_7K2M9Q',
      type: 'stack_template',
      properties: {
        orientation: 'vertical', verticalArrangement: { type: 'spacedBy', spacing: 24 },
        horizontalAlignment: 'center', fillMaxSize: true,
        padding: { start: 24, top: 20, end: 24, bottom: 20 },
      },
      components: [
        {
          id: 'brand_content', type: 'stack_component',
          properties: { orientation: 'vertical', verticalArrangement: { type: 'spacedBy', spacing: 6 }, horizontalAlignment: 'center', fillMaxWidth: true },
          elements: [
            { id: 'brand_logo', type: 'image', properties: { url: '/images/carbroz_logo.png', width: 120, height: 96, contentScale: 'fit' } },
            { id: 'brand_name', type: 'text', properties: { text: 'CarBroz', fontSize: 44, fontWeight: 700, color: '#101522', textAlign: 'center' } },
            {
              id: 'partner_label', type: 'text', properties: {
                text: 'PARTNER', fontSize: 18, fontWeight: 600, letterSpacing: 4, color: '#13B8B5', textAlign: 'center',
                leading: [{ type: 'divider', properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' } }],
                trailing: [{ type: 'divider', properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' } }],
              },
            },
            { id: 'brand_tagline', type: 'text', properties: { text: 'Premium Car Care At Your Doorstep', fontSize: 14, fontWeight: 400, color: '#6B7078', textAlign: 'center' } },
            { id: 'welcome_title', type: 'text', properties: { text: 'Welcome Partner!', fontSize: 32, fontWeight: 700, color: '#101522', textAlign: 'center' } },
            { id: 'welcome_subtitle', type: 'text', properties: { text: 'Login to continue your journey', fontSize: 16, fontWeight: 400, color: '#6B7078', textAlign: 'center' } },
          ],
        },
        {
          id: 'login_content', type: 'stack_component',
          properties: { orientation: 'vertical', verticalArrangement: { type: 'spacedBy', spacing: 14 }, horizontalAlignment: 'center', fillMaxWidth: true },
          sections: [
            {
              id: 'mobile_field_section', type: 'stack_section', properties: { orientation: 'vertical', fillMaxWidth: true },
              groups: [{
                id: 'mobile_field', type: 'stack_group',
                properties: {
                  orientation: 'horizontal', verticalAlignment: 'center', horizontalArrangement: { type: 'spacedBy', spacing: 12 },
                  fillMaxWidth: true, height: 56, padding: { start: 16, end: 16 }, background: { color: '#FFFFFF' },
                  border: { width: 1, color: '#CCE0E3' }, shape: { type: 'roundedCorner', cornerRadius: 16 },
                },
                elements: [
                  {
                    id: 'country_code', type: 'text', properties: {
                      text: '+91', fontSize: 18, fontWeight: 600, color: '#101522',
                      trailing: [{ type: 'divider', properties: { orientation: 'vertical', height: 24, thickness: 1, color: '#D4DEE1' } }],
                    },
                  },
                  {
                    id: 'mobile_number', type: 'input',
                    properties: { placeholder: '98765 43210', keyboardType: 'phone', maxLength: 10, weight: 1 },
                    binding: { key: 'mobileNumber' },
                    validation: { required: true, pattern: '^[6-9][0-9]{9}$', message: 'Enter a valid 10-digit mobile number' },
                  },
                ],
              }],
            },
            {
              id: 'action_section', type: 'stack_section',
              properties: { orientation: 'vertical', verticalArrangement: { type: 'spacedBy', spacing: 12 }, horizontalAlignment: 'center', fillMaxWidth: true },
              elements: [
                {
                  id: 'continue_button', type: 'button',
                  properties: {
                    text: 'Continue', fillMaxWidth: true, height: 56, fontSize: 18, fontWeight: 600, textColor: '#FFFFFF',
                    shape: { type: 'roundedCorner', cornerRadius: 16 },
                    background: { type: 'linearGradient', angle: 90, colors: [{ color: '#28CBC7', stop: 0 }, { color: '#10B6B3', stop: 1 }] },
                    trailing: [{ type: 'icon', properties: { name: 'arrow_forward', size: 22, color: '#FFFFFF' } }],
                  },
                  actions: {
                    onClick: {
                      type: 'request',
                      payload: {
                        method: 'POST', endpoint: '/api/v1/partner/auth/send_otp', authentication: 'NONE', validate: true,
                        body: { mobileNumber: { $binding: 'mobileNumber' } }, responseMode: 'destination',
                      },
                    },
                  },
                },
                {
                  id: 'legal_text', type: 'text', properties: {
                    text: 'By continuing, you agree to our Terms & Conditions and Privacy Policy', fillMaxWidth: true,
                    fontSize: 13, fontWeight: 400, lineHeight: 19, color: '#6B7078', textAlign: 'center',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'hero_content', type: 'stack_component', properties: { orientation: 'vertical', horizontalAlignment: 'center', fillMaxWidth: true },
          elements: [{ id: 'hero_car', type: 'image', properties: { url: '/images/img_splash_car.png', fillMaxWidth: true, maxWidth: 420, contentScale: 'fit' } }],
        },
      ],
    },
  });
}
