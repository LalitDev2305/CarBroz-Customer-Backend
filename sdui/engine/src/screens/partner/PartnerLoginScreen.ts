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
    return this.builder.screen(this.screenId, this.targetApp, $ =>
      $.stackTemplate('tpl_7K2M9Q', $ =>
        $.setSpacing(24)
          .setHorizontalAlignment('center')
          .setFillMaxSize()
          .setPadding({ start: 24, top: 20, end: 24, bottom: 20 })
          .stackComponent('brand_content', $ =>
            $.setSpacing(6)
              .setHorizontalAlignment('center')
              .setFillMaxWidth()
              .imageElement('brand_logo', $ =>
                $.setUrl('/images/carbroz_logo.png')
                  .setWidth(120)
                  .setHeight(96)
              )
              .textElement('brand_name', $ =>
                $.setText('CarBroz')
                  .setFontSize(44)
                  .setFontWeight(700)
                  .setColor('#101522')
                  .setTextAlign('center')
              )
              .textElement('partner_label', $ =>
                $.setText('PARTNER')
                  .setLeading({
                    type: 'divider',
                    properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' },
                  })
                  .setTrailing({
                    type: 'divider',
                    properties: { orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' },
                  })
                  .setFontSize(18)
                  .setFontWeight(600)
                  .setLetterSpacing(4)
                  .setColor('#13B8B5')
                  .setTextAlign('center')
              )
              .textElement('brand_tagline', $ =>
                $.setText('Premium Car Care At Your Doorstep')
                  .setFontSize(14)
                  .setFontWeight(400)
                  .setColor('#6B7078')
                  .setTextAlign('center')
              )
              .textElement('welcome_title', $ =>
                $.setSpans([
                  { text: 'Welcome ' },
                  { text: 'Partner!', color: '#13B8B5' },
                ])
                  .setFontSize(32)
                  .setFontWeight(700)
                  .setColor('#101522')
                  .setTextAlign('center')
              )
              .textElement('welcome_subtitle', $ =>
                $.setText('Login to continue your journey')
                  .setFontSize(16)
                  .setFontWeight(400)
                  .setColor('#6B7078')
                  .setTextAlign('center')
              )
          )
          .stackComponent('login_content', $ =>
            $.setSpacing(14)
              .setHorizontalAlignment('center')
              .setFillMaxWidth()
              .stackSection('mobile_field_section', $ =>
                $.setFillMaxWidth()
                  .stackGroup('mobile_field', $ =>
                    $.setOrientation('horizontal')
                      .setVerticalAlignment('center')
                      .setSpacing(12)
                      .setFillMaxWidth()
                      .setHeight(56)
                      .setPadding({ start: 16, end: 16 })
                      .setBackground({ color: '#FFFFFF' })
                      .setBorder({ width: 1, color: '#CCE0E3' })
                      .setShape({ type: 'roundedCorner', cornerRadius: 16 })
                      .textElement('country_code', $ =>
                        $.setText('+91')
                          .setTrailing({
                            type: 'divider',
                            properties: { orientation: 'vertical', height: 24, thickness: 1, color: '#D4DEE1' },
                          })
                          .setFontSize(18)
                          .setFontWeight(600)
                          .setColor('#101522')
                      )
                      .inputElement('mobile_number', $ =>
                        $.setPlaceholder('98765 43210')
                          .setMaxLength(10)
                          .setWeight(1)
                          .setKeyboardType('phone')
                          .setBinding('mobileNumber')
                          .setValidation({
                            required: true,
                            pattern: '^[6-9][0-9]{9}$',
                            message: 'Enter a valid 10-digit mobile number',
                          })
                      )
                  )
              )
              .stackSection('action_section', $ =>
                $.setSpacing(12)
                  .setHorizontalAlignment('center')
                  .setFillMaxWidth()
                  .buttonElement('continue_button', $ =>
                    $.setText('Continue')
                      .setTrailing({
                        type: 'icon',
                        properties: { name: 'arrow_forward', size: 22, color: '#FFFFFF' },
                      })
                      .setFillMaxWidth()
                      .setHeight(56)
                      .setFontSize(18)
                      .setFontWeight(600)
                      .setTextColor('#FFFFFF')
                      .setShape({ type: 'roundedCorner', cornerRadius: 16 })
                      .setBackground({
                        type: 'linearGradient',
                        angle: 90,
                        colors: [
                          { color: '#28CBC7', stop: 0 },
                          { color: '#10B6B3', stop: 1 },
                        ],
                      })
                      .setOnClick(action.request({
                        method: 'POST',
                        endpoint: '/api/v1/partner/auth/send_otp',
                        authentication: 'NONE',
                        validate: true,
                        responseMode: 'destination',
                        body: {
                          phoneNumber: ref.binding('mobileNumber'),
                          deviceId: ref.context('deviceId'),
                        },
                      }))
                  )
                  .textElement('legal_text', $ =>
                    $.setSpans([
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
                    ])
                      .setFillMaxWidth()
                      .setFontSize(13)
                      .setFontWeight(400)
                      .setLineHeight(19)
                      .setColor('#6B7078')
                      .setTextAlign('center')
                  )
              )
          )
          .stackComponent('hero_content', $ =>
            $.setHorizontalAlignment('center')
              .setFillMaxWidth()
              .imageElement('hero_car', $ =>
                $.setUrl('/images/img_splash_car.png')
                  .setFillMaxWidth()
                  .setMaxWidth(420)
              )
          )
      )
    );
  }
}
