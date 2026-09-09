import {
  CURRENT_SDUI_SCHEMA_VERSION,
  SduiScreenBuilder,
  type SduiScreen,
  type StackComponentBuilder,
  type StackTemplateBuilder,
} from '@carbroz/ui-sdk';

export class PartnerOtpScreenBuilder {
  build(): SduiScreen {
    const screen = new SduiScreenBuilder();

    screen
      .id('partner_otp')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');

    const theme = screen.theme();
    theme
      .light()
      .statusBarTransparent();

    const gradient = theme.linearGradient();
    gradient
      .angle(135)
      .addColor('#DDF8F6', 0)
      .addColor('#F7FEFD', 0.28)
      .addColor('#FFFFFF', 0.55)
      .addColor('#D9F7F4', 1);

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

    const title = header.addText('otp_title');
    title
      .value('Verify OTP')
      .fontSize(30)
      .fontWeight(700)
      .color('#101522')
      .textAlign('center');

    const subtitle = header.addText('otp_subtitle');
    subtitle
      .value('Enter the 6-digit code sent to your mobile number')
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

    const otpInput = section.addInput('otp_input');
    otpInput
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

    const verifyButton = section.addButton('verify_otp_button');
    verifyButton
      .text('Verify & Continue')
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
      });

    const request = verifyButton.onClickRequest();
    request
      .method('POST')
      .endpoint('/api/v1/partner/auth/verify_otp')
      .authentication('NONE')
      .validate(true)
      .responseMode('destination');

    const body = request.body();
    body.response('challengeId', 'data.challengeId');
    body.context('phoneNumber', 'authFlow.phoneNumber');
    body.binding('otp', 'otp');
    body.context('deviceId', 'deviceId');
  }
}
