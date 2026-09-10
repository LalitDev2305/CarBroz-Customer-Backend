import type { ScreenComposer } from '../../core/ScreenComposer.js';
import type { ScreenContext } from '../../core/ScreenContext.js';
import type { SduiScreen } from '../../core/SduiModel.js';
import { binding, context, requestAction } from '../../core/Action.js';
import { SduiBuilder } from '../../core/SduiBuilder.js';

export class PartnerLoginScreen implements ScreenComposer {
  readonly screenId = 'partner_login';
  readonly targetApp = 'PARTNER' as const;

  constructor(private readonly builder = new SduiBuilder()) {}

  build(_context: ScreenContext): SduiScreen {
    return this.builder.screen(
      {
        id: this.screenId,
        targetApp: this.targetApp,
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
      },
      screen => {
        screen.template(
          'stack_template',
          'tpl_7K2M9Q',
          {
            orientation: 'vertical',
            verticalArrangement: { type: 'spacedBy', spacing: 24 },
            horizontalAlignment: 'center',
            fillMaxSize: true,
            padding: { start: 24, top: 20, end: 24, bottom: 20 },
          },
          template => {
            template.component(
              'stack_component',
              'brand_content',
              {
                orientation: 'vertical',
                verticalArrangement: { type: 'spacedBy', spacing: 6 },
                horizontalAlignment: 'center',
                fillMaxWidth: true,
              },
              brand => {
                brand.image('brand_logo', {
                  url: '/images/carbroz_logo.png',
                  width: 120,
                  height: 96,
                  contentScale: 'fit',
                });

                brand.text('brand_name', {
                  text: 'CarBroz',
                  fontSize: 44,
                  fontWeight: 700,
                  color: '#101522',
                  textAlign: 'center',
                });

                brand.text('partner_label', {
                  text: 'PARTNER',
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 4,
                  color: '#13B8B5',
                  textAlign: 'center',
                  leading: [{
                    type: 'divider',
                    properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' },
                  }],
                  trailing: [{
                    type: 'divider',
                    properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' },
                  }],
                });

                brand.text('brand_tagline', {
                  text: 'Premium Car Care At Your Doorstep',
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#6B7078',
                  textAlign: 'center',
                });

                brand.text('welcome_title', {
                  text: 'Welcome Partner!',
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#101522',
                  textAlign: 'center',
                });

                brand.text('welcome_subtitle', {
                  text: 'Login to continue your journey',
                  fontSize: 16,
                  fontWeight: 400,
                  color: '#6B7078',
                  textAlign: 'center',
                });
              },
            );

            template.component(
              'stack_component',
              'login_content',
              {
                orientation: 'vertical',
                verticalArrangement: { type: 'spacedBy', spacing: 14 },
                horizontalAlignment: 'center',
                fillMaxWidth: true,
              },
              login => {
                login.section(
                  'stack_section',
                  'mobile_field_section',
                  { orientation: 'vertical', fillMaxWidth: true },
                  section => {
                    section.group(
                      'stack_group',
                      'mobile_field',
                      {
                        orientation: 'horizontal',
                        verticalAlignment: 'center',
                        horizontalArrangement: { type: 'spacedBy', spacing: 12 },
                        fillMaxWidth: true,
                        height: 56,
                        padding: { start: 16, end: 16 },
                        background: { color: '#FFFFFF' },
                        border: { width: 1, color: '#CCE0E3' },
                        shape: { type: 'roundedCorner', cornerRadius: 16 },
                      },
                      group => {
                        group.text('country_code', {
                          text: '+91',
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#101522',
                          trailing: [{
                            type: 'divider',
                            properties: { orientation: 'vertical', height: 24, thickness: 1, color: '#D4DEE1' },
                          }],
                        });

                        group.input(
                          'mobile_number',
                          {
                            placeholder: '98765 43210',
                            keyboardType: 'phone',
                            maxLength: 10,
                            weight: 1,
                          },
                          {
                            binding: { key: 'mobileNumber' },
                            validation: {
                              required: true,
                              pattern: '^[6-9][0-9]{9}$',
                              message: 'Enter a valid 10-digit mobile number',
                            },
                          },
                        );
                      },
                    );
                  },
                );

                login.section(
                  'stack_section',
                  'action_section',
                  {
                    orientation: 'vertical',
                    verticalArrangement: { type: 'spacedBy', spacing: 12 },
                    horizontalAlignment: 'center',
                    fillMaxWidth: true,
                  },
                  section => {
                    section.button(
                      'continue_button',
                      {
                        text: 'Continue',
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
                        trailing: [{
                          type: 'icon',
                          properties: { name: 'arrow_forward', size: 22, color: '#FFFFFF' },
                        }],
                      },
                      {
                        actions: {
                          onClick: requestAction({
                            method: 'POST',
                            endpoint: '/api/v1/partner/auth/send_otp',
                            authentication: 'NONE',
                            validate: true,
                            responseMode: 'destination',
                            body: {
                              phoneNumber: binding('mobileNumber'),
                              deviceId: context('deviceId'),
                            },
                          }),
                        },
                      },
                    );

                    section.text('legal_text', {
                      text: 'By continuing, you agree to our Terms & Conditions and Privacy Policy',
                      fillMaxWidth: true,
                      fontSize: 13,
                      fontWeight: 400,
                      lineHeight: 19,
                      color: '#6B7078',
                      textAlign: 'center',
                    });
                  },
                );
              },
            );

            template.component(
              'stack_component',
              'hero_content',
              {
                orientation: 'vertical',
                horizontalAlignment: 'center',
                fillMaxWidth: true,
              },
              hero => {
                hero.image('hero_car', {
                  url: '/images/img_splash_car.png',
                  fillMaxWidth: true,
                  maxWidth: 420,
                  contentScale: 'fit',
                });
              },
            );
          },
        );
      },
    );
  }
}
