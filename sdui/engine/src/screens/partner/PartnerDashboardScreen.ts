import type { ScreenComposer } from '../../core/ScreenComposer.js';
import type { ScreenContext } from '../../core/ScreenContext.js';
import type { SduiScreen } from '../../core/SduiModel.js';
import { SduiBuilder } from '../../core/SduiBuilder.js';

export class PartnerDashboardScreen implements ScreenComposer {
  readonly screenId = 'partner_dashboard';
  readonly targetApp = 'PARTNER' as const;

  constructor(private readonly builder = new SduiBuilder()) {}

  build(_context: ScreenContext): SduiScreen {
    return this.builder.screen(this.screenId, this.targetApp, $ =>
      $.defaultTemplate('partner_dashboard_template', $ =>
        $.setFillMaxSize()
          .setPadding({ start: 24, top: 24, end: 24, bottom: 24 })
          .stackComponent('dashboard_shell', $ =>
            $.setSpacing(8)
              .setFillMaxWidth()
              .textElement('dashboard_title', $ =>
                $.setText('Partner Dashboard')
                  .setFontSize(28)
                  .setFontWeight(700)
                  .setColor('#101522')
              )
              .textElement('dashboard_status', $ =>
                $.setText('Your workspace is ready.')
                  .setFontSize(15)
                  .setFontWeight(400)
                  .setColor('#6B7078')
              )
          )
      )
    );
  }
}
