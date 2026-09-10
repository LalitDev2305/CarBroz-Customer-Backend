import type { ScreenComposer } from '../../core/ScreenComposer.js';
import type { ScreenContext } from '../../core/ScreenContext.js';
import type { SduiScreen } from '../../core/SduiModel.js';
import { action, ref } from '../../core/Action.js';
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
      },
      screen => {
        screen.template('stack_template', 'tpl_7K2M9Q', template => {
          template.base()
            .spacing(24)
            .horizontalAlignment('center')
            .fillMaxSize()
            .padding({ start: 24, top: 20, end: 24, bottom: 20 });

          template.component('stack_component', 'brand_content', brand => {
            brand.base()
              .spacing(6)
              .horizontalAlignment('center')
              .fillMaxWidth();

            brand.image('brand_logo', image => {
              image.content().url('/images/carbroz_logo.png');
              image.base().width(120).height(96);
            });

            brand.text('brand_name', text => {
              text.content().text('CarBroz');
              text.style().fontSize(44).fontWeight(700).color('#101522').textAlign('center');
            });

            brand.text('partner_label', text => {
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

            brand.text('brand_tagline', text => {
              text.content().text('Premium Car Care At Your Doorstep');
              text.style().fontSize(14).fontWeight(400).color('#6B7078').textAlign('center');
            });

            brand.text('welcome_title', text => {
              text.content().text('Welcome Partner!');
              text.style().fontSize(32).fontWeight(700).color('#101522').textAlign('center');
            });

            brand.text('welcome_subtitle', text => {
              text.content().text('Login to continue your journey');
              text.style().fontSize(16).fontWeight(400).color('#6B7078').textAlign('center');
            });
          });

          template.component('stack_component', 'login_content', login => {
            login.base().spacing(14).horizontalAlignment('center').fillMaxWidth();

            login.section('stack_section', 'mobile_field_section', section => {
              section.base().fillMaxWidth();

              section.group('stack_group', 'mobile_field', group => {
                group.base()
                  .horizontal()
                  .verticalAlignment('center')
                  .spacing(12)
                  .fillMaxWidth()
                  .height(56)
                  .padding({ start: 16, end: 16 });
                group.style()
                  .background({ color: '#FFFFFF' })
                  .border({ width: 1, color: '#CCE0E3' })
                  .shape({ type: 'roundedCorner', cornerRadius: 16 });

                group.text('country_code', text => {
                  text.content()
                    .text('+91')
                    .trailing([{
                      type: 'divider',
                      properties: { orientation: 'vertical', height: 24, thickness: 1, color: '#D4DEE1' },
                    }]);
                  text.style().fontSize(18).fontWeight(600).color('#101522');
                });

                group.input('mobile_number', input => {
                  input.content().placeholder('98765 43210').maxLength(10);
                  input.base().weight(1);
                  input.behavior()
                    .keyboardType('phone')
                    .binding('mobileNumber')
                    .validation({
                      required: true,
                      pattern: '^[6-9][0-9]{9}$',
                      message: 'Enter a valid 10-digit mobile number',
                    });
                });
              });
            });

            login.section('stack_section', 'action_section', section => {
              section.base().spacing(12).horizontalAlignment('center').fillMaxWidth();

              section.button('continue_button', button => {
                button.content()
                  .text('Continue')
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
                  endpoint: '/api/v1/partner/auth/send_otp',
                  authentication: 'NONE',
                  validate: true,
                  responseMode: 'destination',
                  body: {
                    phoneNumber: ref.binding('mobileNumber'),
                    deviceId: ref.context('deviceId'),
                  },
                }));
              });

              section.text('legal_text', text => {
                text.content().text('By continuing, you agree to our Terms & Conditions and Privacy Policy');
                text.base().fillMaxWidth();
                text.style().fontSize(13).fontWeight(400).lineHeight(19).color('#6B7078').textAlign('center');
              });
            });
          });

          template.component('stack_component', 'hero_content', hero => {
            hero.base().horizontalAlignment('center').fillMaxWidth();

            hero.image('hero_car', image => {
              image.content().url('/images/img_splash_car.png');
              image.base().fillMaxWidth().maxWidth(420);
            });
          });
        });
      },
    );
  }
}
