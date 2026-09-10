import type { ScreenComposer } from '../../core/ScreenComposer.js';
import type { ScreenContext } from '../../core/ScreenContext.js';
import type { SduiScreen } from '../../core/SduiModel.js';
import { SduiBuilder } from '../../core/SduiBuilder.js';

export class PartnerDashboardScreen implements ScreenComposer {
  readonly screenId = 'partner_dashboard';
  readonly targetApp = 'PARTNER' as const;

  constructor(private readonly builder = new SduiBuilder()) {}

  build(_context: ScreenContext): SduiScreen {
    return this.builder.screen({
      id: this.screenId,
      targetApp: this.targetApp,
      theme: { theme: 'light', statusBar: 'transparent' },
    }, screen => {
      screen.template('default_template', 'partner_dashboard_template', template => {
        template.base()
          .vertical()
          .fillMaxSize()
          .padding({ start: 24, top: 24, end: 24, bottom: 24 });

        template.component('stack_component', 'dashboard_shell', shell => {
          shell.base().vertical().spacing(8).fillMaxWidth();

          shell.text('dashboard_title', title => {
            title.content().text('Partner Dashboard');
            title.style().fontSize(28).fontWeight(700).color('#101522');
          });

          shell.text('dashboard_status', status => {
            status.content().text('Your workspace is ready.');
            status.style().fontSize(15).fontWeight(400).color('#6B7078');
          });
        });
      });
    });
  }
}
