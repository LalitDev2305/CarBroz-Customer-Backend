import {
  CURRENT_SDUI_SCHEMA_VERSION,
  SduiScreenBuilder,
  type SduiScreen,
} from '@carbroz/ui-sdk';

export class PartnerDashboardScreenBuilder {
  build(): SduiScreen {
    const screen = new SduiScreenBuilder();

    screen
      .id('partner_dashboard')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');

    const theme = screen.theme();
    theme
      .light()
      .statusBarTransparent();

    const template = screen.addDefaultTemplate('partner_dashboard_template');
    template
      .vertical()
      .fillMaxSize()
      .padding({ start: 24, top: 24, end: 24, bottom: 24 });

    const shell = template.addStackComponent('dashboard_shell');
    shell.vertical().spacing(8).fillMaxWidth();

    const title = shell.addText('dashboard_title');
    title
      .value('Partner Dashboard')
      .fontSize(28)
      .fontWeight(700)
      .color('#101522');

    const status = shell.addText('dashboard_status');
    status
      .value('Your workspace is ready.')
      .fontSize(15)
      .fontWeight(400)
      .color('#6B7078');

    return screen.build();
  }
}
