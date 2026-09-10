import { PartnerOtpScreen, type SduiScreen } from '@carbroz/sdui-engine';

/** Transport compatibility wrapper; SDUI presentation composition is owned by the engine. */
export function createPartnerOtpScreen(): SduiScreen {
  return new PartnerOtpScreen().build({});
}
