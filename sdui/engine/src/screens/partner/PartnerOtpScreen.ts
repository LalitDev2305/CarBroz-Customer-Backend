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
    return this.builder.screen({
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
    }, screen => {
      screen.template('form_template', 'tpl_partner_otp_v1', template => {
        template.base()
          .vertical()
          .spacing(24)
          .horizontalAlignment('center')
          .fillMaxSize()
          .padding({ start: 24, top: 32, end: 24, bottom: 24 });

        template.component('stack_component', 'otp_header', header => {
          header.base().vertical().spacing(8).horizontalAlignment('center').fillMaxWidth();

          header.text('otp_title', title => {
            title.content().text('Verify OTP');
            title.style().fontSize(30).fontWeight(700).color('#101522').textAlign('center');
          });

          header.text('otp_subtitle', subtitle => {
            subtitle.content().text('Enter the 6-digit code sent to your mobile number');
            subtitle.base().fillMaxWidth();
            subtitle.style().fontSize(15).fontWeight(400).color('#6B7078').textAlign('center');
          });
        });

        template.component('stack_component', 'otp_form', form => {
          form.base().vertical().spacing(16).horizontalAlignment('center').fillMaxWidth();

          form.section('stack_section', 'otp_input_section', section => {
            section.base().vertical().horizontalAlignment('center').fillMaxWidth();

            section.input('otp_input', input => {
              input.content().placeholder('000000').maxLength(6);
              input.base().fillMaxWidth().height(56);
              input.style().textAlign('center');
              input.behavior()
                .keyboardType('number')
                .binding('otp')
                .required()
                .pattern('^[0-9]{6}$', 'Enter the 6-digit OTP');
            });
          });

          form.section('stack_section', 'otp_action_section', section => {
            section.base().vertical().spacing(12).horizontalAlignment('center').fillMaxWidth();

            section.button('verify_otp_button', button => {
              button.content().text('Verify & Continue');
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
          });
        });
      });
    });
  }
}
