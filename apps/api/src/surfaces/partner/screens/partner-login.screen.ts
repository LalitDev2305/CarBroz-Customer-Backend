import { productionSduiService, type SduiScreen } from '@carbroz/sdui-engine';

/** Transport compatibility wrapper; composition/registration/validation are engine-owned. */
export function createPartnerLoginScreen(): SduiScreen {
  return productionSduiService.buildScreen({ targetApp: 'PARTNER', screenId: 'partner_login' });
}
