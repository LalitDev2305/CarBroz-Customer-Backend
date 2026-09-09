import {
  CURRENT_SDUI_SCHEMA_VERSION,
  SduiScreenBuilder,
  type SduiScreen,
  type StackComponentBuilder,
  type StackTemplateBuilder,
} from '@carbroz/ui-sdk';

export class PartnerLoginScreenBuilder {
  build(): SduiScreen {
    const screen = new SduiScreenBuilder();

    screen
      .id('partner_login')
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

    const template = screen.addStackTemplate('tpl_7K2M9Q');
    template
      .vertical()
      .spacing(24)
      .horizontalAlignment('center')
      .fillMaxSize()
      .padding({ start: 24, top: 20, end: 24, bottom: 20 });

    this.addBrandComponent(template);
    this.addLoginComponent(template);
    this.addHeroComponent(template);

    return screen.build();
  }

  private addBrandComponent(template: StackTemplateBuilder): void {
    const brand = template.addStackComponent('brand_content');
    brand.vertical().spacing(6).horizontalAlignment('center').fillMaxWidth();

    const logo = brand.addImage('brand_logo');
    logo
      .source('/images/carbroz_logo.png')
      .size(120, 96)
      .contentScale('fit');

    const brandName = brand.addText('brand_name');
    brandName
      .value('CarBroz')
      .fontSize(44)
      .fontWeight(700)
      .color('#101522')
      .textAlign('center');

    const partnerLabel = brand.addText('partner_label');
    partnerLabel
      .value('PARTNER')
      .fontSize(18)
      .fontWeight(600)
      .letterSpacing(4)
      .color('#13B8B5')
      .textAlign('center')
      .leadingDivider({ orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' })
      .trailingDivider({ orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' });

    const tagline = brand.addText('brand_tagline');
    tagline
      .value('Premium Car Care At Your Doorstep')
      .fontSize(14)
      .fontWeight(400)
      .color('#6B7078')
      .textAlign('center');

    const welcomeTitle = brand.addText('welcome_title');
    welcomeTitle
      .value('Welcome Partner!')
      .fontSize(32)
      .fontWeight(700)
      .color('#101522')
      .textAlign('center');

    const welcomeSubtitle = brand.addText('welcome_subtitle');
    welcomeSubtitle
      .value('Login to continue your journey')
      .fontSize(16)
      .fontWeight(400)
      .color('#6B7078')
      .textAlign('center');
  }

  private addLoginComponent(template: StackTemplateBuilder): void {
    const login = template.addStackComponent('login_content');
    login.vertical().spacing(14).horizontalAlignment('center').fillMaxWidth();

    this.addMobileFieldSection(login);
    this.addActionSection(login);
  }

  private addMobileFieldSection(component: StackComponentBuilder): void {
    const section = component.addStackSection('mobile_field_section');
    section.vertical().fillMaxWidth();

    const group = section.addStackGroup('mobile_field');
    group
      .horizontal()
      .verticalAlignment('center')
      .spacing(12)
      .fillMaxWidth()
      .height(56)
      .padding({ start: 16, end: 16 })
      .background({ color: '#FFFFFF' })
      .border({ width: 1, color: '#CCE0E3' })
      .shape({ type: 'roundedCorner', cornerRadius: 16 });

    const countryCode = group.addText('country_code');
    countryCode
      .value('+91')
      .fontSize(18)
      .fontWeight(600)
      .color('#101522')
      .trailingDivider({ orientation: 'vertical', height: 24, thickness: 1, color: '#D4DEE1' });

    const mobileInput = group.addInput('mobile_number');
    mobileInput
      .placeholder('98765 43210')
      .phone()
      .maxLength(10)
      .weight(1)
      .bind('mobileNumber')
      .required()
      .pattern('^[6-9][0-9]{9}$', 'Enter a valid 10-digit mobile number');
  }

  private addActionSection(component: StackComponentBuilder): void {
    const section = component.addStackSection('action_section');
    section.vertical().spacing(12).horizontalAlignment('center').fillMaxWidth();

    const continueButton = section.addButton('continue_button');
    continueButton
      .text('Continue')
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
      .trailingIcon({ name: 'arrow_forward', size: 22, color: '#FFFFFF' });

    const request = continueButton.onClickRequest();
    request
      .method('POST')
      .endpoint('/api/v1/partner/auth/send_otp')
      .authentication('NONE')
      .validate(true)
      .responseMode('destination');

    const body = request.body();
    body.binding('phoneNumber', 'mobileNumber');
    body.context('deviceId', 'deviceId');

    const legalText = section.addText('legal_text');
    legalText
      .value('By continuing, you agree to our Terms & Conditions and Privacy Policy')
      .fillMaxWidth()
      .fontSize(13)
      .fontWeight(400)
      .lineHeight(19)
      .color('#6B7078')
      .textAlign('center');
  }

  private addHeroComponent(template: StackTemplateBuilder): void {
    const hero = template.addStackComponent('hero_content');
    hero.vertical().horizontalAlignment('center').fillMaxWidth();

    const heroCar = hero.addImage('hero_car');
    heroCar
      .source('/images/img_splash_car.png')
      .fillMaxWidth()
      .maxWidth(420)
      .contentScale('fit');
  }
}
