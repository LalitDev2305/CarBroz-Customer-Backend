import {
  BaseSduiScreenBuilder,
  CURRENT_SDUI_SCHEMA_VERSION,
  type SduiScreen,
  type StackComponentBuilder,
  type StackTemplateBuilder,
} from '@carbroz/ui-sdk';

/** Identity-owned Partner OTP SDUI composition. */
export class PartnerOtpScreenBuilder {
  build(): SduiScreen {
    const screen = new BaseSduiScreenBuilder({
      screenId: 'partner_otp',
      schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: 'PARTNER',
    });

    screen.withTheme({
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

    const template = screen.addFormTemplate('tpl_partner_otp_v1');
    template
      .vertical()
      .spacing(24)
      .horizontalAlignment('center')
      .fillMaxSize()
      .padding({ start: 24, top: 32, end: 24, bottom: 24 });

    this.addHeaderComponent(template);
    this.addOtpFormComponent(template);

    return screen.build();
  }

  private addHeaderComponent(template: StackTemplateBuilder): void {
    const header = template.addStackComponent('otp_header');
    header.vertical().spacing(8).horizontalAlignment('center').fillMaxWidth();

    header.addText('otp_title', 'Verify OTP')
      .fontSize(30)
      .fontWeight(700)
      .color('#101522')
      .textAlign('center');

    header.addText('otp_subtitle', 'Enter the 6-digit code sent to your mobile number')
      .fontSize(15)
      .fontWeight(400)
      .color('#6B7078')
      .textAlign('center')
      .fillMaxWidth();
  }

  private addOtpFormComponent(template: StackTemplateBuilder): void {
    const form = template.addStackComponent('otp_form');
    form.vertical().spacing(16).horizontalAlignment('center').fillMaxWidth();

    this.addOtpInputSection(form);
    this.addOtpActionSection(form);
  }

  private addOtpInputSection(component: StackComponentBuilder): void {
    const section = component.addStackSection('otp_input_section');
    section.vertical().horizontalAlignment('center').fillMaxWidth();

    section.addInput('otp_input')
      .placeholder('000000')
      .number()
      .maxLength(6)
      .fillMaxWidth()
      .height(56)
      .textAlign('center')
      .bind('otp')
      .required()
      .pattern('^[0-9]{6}$', 'Enter the 6-digit OTP');
  }

  private addOtpActionSection(component: StackComponentBuilder): void {
    const section = component.addStackSection('otp_action_section');
    section.vertical().spacing(12).horizontalAlignment('center').fillMaxWidth();

    section.addButton('verify_otp_button', 'Verify & Continue')
      .fillMaxWidth()
      .height(56)
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
      })
      .onClick({
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
      });
  }
}
