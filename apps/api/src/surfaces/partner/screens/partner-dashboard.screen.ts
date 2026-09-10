import { PartnerDashboardScreen, type SduiScreen } from '@carbroz/sdui-engine';

/** Transport compatibility wrapper; SDUI presentation composition is owned by the engine. */
export function createPartnerDashboardScreen(): SduiScreen {
  return new PartnerDashboardScreen().build({});
}
