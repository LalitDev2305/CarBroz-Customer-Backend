import {
  BaseSduiScreenBuilder,
  CURRENT_SDUI_SCHEMA_VERSION,
  type SduiScreen,
  type StackComponentBuilder,
  type StackTemplateBuilder,
} from '@carbroz/ui-sdk';

/** Identity-owned Partner Login SDUI composition. */
export class PartnerLoginScreenBuilder {
  build(): SduiScreen {
    const screen = new BaseSduiScreenBuilder({
      screenId: 'partner_login',
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

    brand.addImage('brand_logo', '/images/carbroz_logo.png')
      .size(120, 96)
      .contentScale('fit');

    brand.addText('brand_name', 'CarBroz')
      .fontSize(44)
      .fontWeight(700)
      .color('#101522')
      .textAlign('center');

    brand.addText('partner_label', 'PARTNER')
      .fontSize(18)
      .fontWeight(600)
      .letterSpacing(4)
      .color('#13B8B5')
      .textAlign('center')
      .leadingDivider({ orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' })
      .trailingDivider({ orientation: 'horizontal', width: 36, thickness: 2, color: '#13B8B5' });

    brand.addText('brand_tagline', 'Premium Car Care At Your Doorstep')
      .fontSize(14)
      .fontWeight(400)
      .color('#6B7078')
      .textAlign('center');

    brand.addText('welcome_title', 'Welcome Partner!')
      .fontSize(32)
      .fontWeight(700)
      .color('#101522')
      .textAlign('center');

    brand.addText('welcome_subtitle', 'Login to continue your journey')
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

    group.addText('country_code', '+91')
      .fontSize(18)
      .fontWeight(600)
      .color('#101522')
      .trailingDivider({ orientation: 'vertical', height: 24, thickness: 1, color: '#D4DEE1' });

    group.addInput('mobile_number')
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

    section.addButton('continue_button', 'Continue')
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
      .trailingIcon({ name: 'arrow_forward', size: 22, color: '#FFFFFF' })
      .onClick({
        type: 'request',
        payload: {
          method: 'POST',
          endpoint: '/api/v1/partner/auth/send_otp',
          authentication: 'NONE',
          validate: true,
          body: {
            phoneNumber: { $binding: 'mobileNumber' },
            deviceId: { $context: 'deviceId' },
          },
          responseMode: 'destination',
        },
      });

    section.addText('legal_text', 'By continuing, you agree to our Terms & Conditions and Privacy Policy')
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

    hero.addImage('hero_car', '/images/img_splash_car.png')
      .fillMaxWidth()
      .maxWidth(420)
      .contentScale('fit');
  }
}
