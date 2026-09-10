import type { ScreenComposer } from '../../core/ScreenComposer.js';
import type { ScreenContext } from '../../core/ScreenContext.js';
import type { SduiScreen } from '../../core/SduiModel.js';
import { action, ref } from '../../core/Action.js';
import { SduiBuilder } from '../../core/SduiBuilder.js';

export class PartnerOtpScreen implements ScreenComposer {
  readonly screenId = 'partner_otp';
  readonly targetApp = 'PARTNER' as const;

  constructor(private readonly builder = new SduiBuilder()) {}

  build(_context: ScreenContext): SduiScreen {
    return this.builder.screen(
      {
        id: this.screenId,
        targetApp: this.targetApp,
      },
      screen => {
        screen.template('form_template', 'tpl_P6X8N3', template => {
          template.base()
            .spacing(24)
            .horizontalAlignment('center')
            .fillMaxSize()
            .padding({ start: 24, top: 20, end: 24, bottom: 20 });

          template.component('stack_component', 'otp_brand_content', brand => {
            brand.base()
              .spacing(6)
              .horizontalAlignment('center')
              .fillMaxWidth();

            brand.image('otp_brand_logo', image => {
              image.content().url('/images/carbroz_logo.png');
              image.base().width(120).height(96);
            });

            brand.text('otp_brand_name', text => {
              text.content().text('CarBroz');
              text.style().fontSize(44).fontWeight(700).color('#101522').textAlign('center');
            });

            brand.text('otp_partner_label', text => {
              text.content()
                .text('PARTNER')
                .leading([{
                  type: 'divider',
                  properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' },
                }])
                .trailing([{
                  type: 'divider',
                  properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' },
                }]);
              text.style().fontSize(18).fontWeight(600).letterSpacing(4).color('#13B8B5').textAlign('center');
            });

            brand.text('otp_brand_tagline', text => {
              text.content().text('Premium Car Care At Your Doorstep');
              text.style().fontSize(14).fontWeight(400).color('#6B7078').textAlign('center');
            });

            brand.text('otp_screen_title', text => {
              text.content()
                .text('Verify Your Number')
                .spans([
                  { text: 'Verify ' },
                  { text: 'Your', color: '#13B8B5' },
                  { text: ' Number' },
                ]);
              text.style().fontSize(32).fontWeight(700).color('#101522').textAlign('center');
            });

            brand.text('otp_screen_subtitle', text => {
              text.content().text('We have sent a 6-digit code to');
              text.style().fontSize(16).fontWeight(400).color('#6B7078').textAlign('center');
            });

            brand.text('otp_phone_number', text => {
              text.content()
                .text(ref.context('authFlow.phoneNumber'))
                .spans([
                  { text: '+91 ' },
                  { text: ref.context('authFlow.phoneNumber'), fontWeight: 600 },
                ])
                .trailing([{
                  type: 'icon',
                  properties: { name: 'edit', size: 18, color: '#13B8B5' },
                }]);
              text.style().fontSize(16).fontWeight(600).color('#101522').textAlign('center');
              text.behavior().onClick(action.navigate({
                screenId: 'partner_login',
                templateId: 'tpl_7K2M9Q',
                templateType: 'stack_template',
                endpoint: '/api/v1/partner/screen/auth_login',
                method: 'GET',
                authentication: 'NONE',
              }));
            });
          });

          template.component('stack_component', 'otp_content', otp => {
            otp.base().spacing(18).horizontalAlignment('center').fillMaxWidth();

            otp.section('stack_section', 'otp_field_section', section => {
              section.base().horizontalAlignment('center').fillMaxWidth();

              section.group('stack_group', 'otp_fields_group', group => {
                group.base().horizontal().horizontalAlignment('center').fillMaxWidth();

                group.input('otp_code_input', input => {
                  input.content().maxLength(6);
                  input.style()
                    .textAlign('center')
                    .presentation({
                      type: 'segmented',
                      count: 6,
                      spacing: 8,
                      segmentWidth: 44,
                      segmentHeight: 52,
                      background: { color: '#FFFFFF' },
                      border: { width: 1, color: '#CCE0E3' },
                      shape: { type: 'roundedCorner', cornerRadius: 12 },
                    });
                  input.behavior()
                    .keyboardType('number')
                    .binding('otp')
                    .validation({
                      required: true,
                      pattern: '^[0-9]{6}$',
                      message: 'Enter the 6-digit OTP',
                    });
                });
              });
            });

            otp.section('stack_section', 'otp_action_section', section => {
              section.base().spacing(12).horizontalAlignment('center').fillMaxWidth();

              section.text('otp_resend_text', text => {
                text.content().text('Resend OTP');
                text.style().fontSize(14).fontWeight(600).color('#13B8B5').disabledColor('#9CA3AF').textAlign('center');
                text.behavior()
                  .enabled(false)
                  .onClick(action.request({
                    method: 'POST',
                    endpoint: '/api/v1/partner/auth/send_otp',
                    authentication: 'NONE',
                    validate: false,
                    responseMode: 'none',
                    body: {
                      phoneNumber: ref.context('authFlow.phoneNumber'),
                      deviceId: ref.context('deviceId'),
                    },
                  }));
              });

              section.button('otp_verify_button', button => {
                button.content()
                  .text('Verify & Continue')
                  .trailing([{
                    type: 'icon',
                    properties: { name: 'arrow_forward', size: 22, color: '#FFFFFF' },
                  }]);
                button.base().fillMaxWidth().height(56);
                button.style()
                  .fontSize(18)
                  .fontWeight(600)
                  .textColor('#FFFFFF')
                  .shape({ type: 'roundedCorner', cornerRadius: 16 })
                  .background({
                    type: 'linearGradient',
                    angle: 90,
                    colors: [
                      { color: '#28CBC7', stop: 0 },
                      { color: '#10B6B3', stop: 1 },
                    ],
                  });
                button.behavior().onClick(action.request({
                  method: 'POST',
                  endpoint: '/api/v1/partner/auth/verify_otp',
                  authentication: 'NONE',
                  validate: true,
                  responseMode: 'destination',
                  body: {
                    challengeId: ref.response('data.challengeId'),
                    phoneNumber: ref.context('authFlow.phoneNumber'),
                    otp: ref.binding('otp'),
                    deviceId: ref.context('deviceId'),
                  },
                }));
              });

              section.text('otp_legal_text', text => {
                text.content()
                  .text('By continuing, you agree to our Terms & Conditions and Privacy Policy')
                  .spans([
                    { text: 'By continuing, you agree to our ' },
                    {
                      text: 'Terms & Conditions',
                      color: '#13B8B5',
                      underline: true,
                      onClick: action.externalUri(ref.context('legal.termsUri')),
                    },
                    { text: ' and ' },
                    {
                      text: 'Privacy Policy',
                      color: '#13B8B5',
                      underline: true,
                      onClick: action.externalUri(ref.context('legal.privacyUri')),
                    },
                  ]);
                text.base().fillMaxWidth();
                text.style().fontSize(13).fontWeight(400).lineHeight(19).color('#6B7078').textAlign('center');
              });
            });
          });
        });
      },
    );
  }
}
