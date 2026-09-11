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
    return this.builder.screen(this.screenId, this.targetApp, $ =>
      $.formTemplate('tpl_P6X8N3', $ =>
        $.setSpacing(24)
          .setHorizontalAlignment('center')
          .setFillMaxSize()
          .setPadding({ start: 24, top: 20, end: 24, bottom: 20 })
          .stackComponent('otp_brand_content', $ =>
            $.setSpacing(6)
              .setHorizontalAlignment('center')
              .setFillMaxWidth()
              .imageElement('otp_brand_logo', $ =>
                $.setUrl('/images/carbroz_logo.png')
                  .setWidth(120)
                  .setHeight(96)
              )
              .textElement('otp_brand_name', $ =>
                $.setText('CarBroz')
                  .setFontSize(44)
                  .setFontWeight(700)
                  .setColor('#101522')
                  .setTextAlign('center')
              )
              .textElement('otp_partner_label', $ =>
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
              .textElement('otp_brand_tagline', $ =>
                $.setText('Premium Car Care At Your Doorstep')
                  .setFontSize(14)
                  .setFontWeight(400)
                  .setColor('#6B7078')
                  .setTextAlign('center')
              )
              .textElement('otp_screen_title', $ =>
                $.setSpans([
                  { text: 'Verify ' },
                  { text: 'Your', color: '#13B8B5' },
                  { text: ' Number' },
                ])
                  .setFontSize(32)
                  .setFontWeight(700)
                  .setColor('#101522')
                  .setTextAlign('center')
              )
              .textElement('otp_screen_subtitle', $ =>
                $.setText('We have sent a 6-digit code to')
                  .setFontSize(16)
                  .setFontWeight(400)
                  .setColor('#6B7078')
                  .setTextAlign('center')
              )
              .textElement('otp_phone_number', $ =>
                $.setSpans([
                  { text: '+91 ' },
                  { text: ref.context('authFlow.phoneNumber'), fontWeight: 600 },
                ])
                  .setTrailing({
                    type: 'icon',
                    properties: { name: 'edit', size: 18, color: '#13B8B5' },
                  })
                  .setFontSize(16)
                  .setFontWeight(600)
                  .setColor('#101522')
                  .setTextAlign('center')
                  .setOnClick(action.navigate({
                    screenId: 'partner_login',
                    templateId: 'tpl_7K2M9Q',
                    templateType: 'stack_template',
                    endpoint: '/api/v1/partner/screen/auth_login',
                    method: 'GET',
                    authentication: 'NONE',
                  }))
              )
          )
          .stackComponent('otp_content', $ =>
            $.setSpacing(18)
              .setHorizontalAlignment('center')
              .setFillMaxWidth()
              .stackSection('otp_field_section', $ =>
                $.setHorizontalAlignment('center')
                  .setFillMaxWidth()
                  .stackGroup('otp_fields_group', $ =>
                    $.setOrientation('horizontal')
                      .setHorizontalAlignment('center')
                      .setFillMaxWidth()
                      .inputElement('otp_code_input', $ =>
                        $.setMaxLength(6)
                          .setTextAlign('center')
                          .setPresentation({
                            type: 'segmented',
                            count: 6,
                            spacing: 8,
                            segmentWidth: 44,
                            segmentHeight: 52,
                            background: { color: '#FFFFFF' },
                            border: { width: 1, color: '#CCE0E3' },
                            shape: { type: 'roundedCorner', cornerRadius: 12 },
                          })
                          .setKeyboardType('number')
                          .setBinding('otp')
                          .setValidation({
                            required: true,
                            pattern: '^[0-9]{6}$',
                            message: 'Enter the 6-digit OTP',
                          })
                      )
                  )
              )
              .stackSection('otp_action_section', $ =>
                $.setSpacing(12)
                  .setHorizontalAlignment('center')
                  .setFillMaxWidth()
                  .textElement('otp_resend_text', $ =>
                    $.setText('Resend OTP')
                      .setFontSize(14)
                      .setFontWeight(600)
                      .setColor('#13B8B5')
                      .setDisabledColor('#9CA3AF')
                      .setTextAlign('center')
                      .setEnabled(false)
                      .setOnClick(action.request({
                        method: 'POST',
                        endpoint: '/api/v1/partner/auth/send_otp',
                        authentication: 'NONE',
                        validate: false,
                        responseMode: 'none',
                        body: {
                          phoneNumber: ref.context('authFlow.phoneNumber'),
                          deviceId: ref.context('deviceId'),
                        },
                      }))
                  )
                  .buttonElement('otp_verify_button', $ =>
                    $.setText('Verify & Continue')
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
                      }))
                  )
                  .textElement('otp_legal_text', $ =>
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
      )
    );
  }
}
