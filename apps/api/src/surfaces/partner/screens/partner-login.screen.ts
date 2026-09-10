import { PartnerLoginScreen, type SduiScreen } from '@carbroz/sdui-engine';

/** Partner Login SDUI composition. Business authentication remains owned by Identity. */
export function createPartnerLoginScreen(): SduiScreen {
  return new PartnerLoginScreen().build({});
}
